process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1/test';
process.env.JWT_SECRET = 'test-only-secret-with-more-than-32-characters';
process.env.APP_ORIGIN = 'http://localhost:3000';
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createApp = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Session = require('../src/models/Session');
const app = createApp({ connect: async () => {} });
let mongo, agent, other, cookie, productId;
const account = { name: 'Ana', email: 'ana@example.com', password: 'UnaClaveSegura123!' };
const product = { name: 'Cuaderno', description: 'Papel reciclado', price: 49.95, stock: 12 };
beforeAll(async () => {
 mongo = await MongoMemoryServer.create();
 await mongoose.connect(mongo.getUri());
 await User.init(); await Session.init();
});
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); });
beforeEach(async () => {
 jest.restoreAllMocks();
 await Promise.all([User.deleteMany({}), Product.deleteMany({}), Session.deleteMany({})]);
 agent = request.agent(app); other = request.agent(app);
 const response = await agent.post('/api/auth/register').send(account);
 cookie = response.headers['set-cookie'][0].split(';')[0];
 const created = await agent.post('/api/products').send(product);
 productId = created.body.product._id;
});
test('registro guarda hash, cookie HttpOnly y nunca expone contraseña', async () => {
 const res = await other.post('/api/auth/register').send({ ...account, email: 'b@example.com' });
 expect(res.status).toBe(201); expect(res.body.user).not.toHaveProperty('passwordHash');
 expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/); expect(res.headers['set-cookie'][0]).toMatch(/SameSite=Strict/);
 const dbUser = await User.findOne({ email: 'b@example.com' }).select('+passwordHash');
 expect(dbUser.passwordHash).not.toBe(account.password); expect(dbUser.passwordHash).toMatch(/^\$2/);
});
test('correo duplicado produce 409', async () => { expect((await other.post('/api/auth/register').send(account)).status).toBe(409); });
test.each([
 { ...account, email: 'incorrecto' }, { ...account, password: 'corta' }, { ...account, role: 'admin' }, { ...account, password: '😀'.repeat(25) }
])('rechaza registro inválido %#', async body => { expect((await other.post('/api/auth/register').send(body)).status).toBe(400); });
test('login correcto y consulta del perfil', async () => {
 expect((await other.post('/api/auth/login').send({ email: account.email, password: account.password })).status).toBe(200);
 const me = await other.get('/api/auth/me'); expect(me.body.user.email).toBe(account.email); expect(me.body.user).not.toHaveProperty('passwordHash');
});
test.each(['ana@example.com', 'nadie@example.com'])('login incorrecto para %s', async email => { expect((await other.post('/api/auth/login').send({ email, password: 'incorrecta' })).status).toBe(401); });
test.each([['get','/api/products'],['post','/api/products'],['get','/api/products/000000000000000000000001'],['patch','/api/products/000000000000000000000001'],['delete','/api/products/000000000000000000000001']])('protege %s %s', async (method, path) => {
 const res = await request(app)[method](path).send({}); expect(res.status).toBe(401);
});
test('JWT manipulado y JWT expirado se rechazan', async () => {
 for (const token of ['falso.token.falso', jwt.sign({}, process.env.JWT_SECRET, { subject: '000000000000000000000001', expiresIn: -1, issuer: 'inventario', audience: 'inventario-web' })]) {
  expect((await request(app).get('/api/products').set('Authorization', 'Bearer ' + token)).status).toBe(401);
 }
});
test('logout invalida el JWT incluso si se reutiliza manualmente', async () => {
 const token = cookie.slice('token='.length);
 expect((await agent.post('/api/auth/logout').send({})).status).toBe(204);
 expect((await request(app).get('/api/products').set('Authorization', 'Bearer ' + token)).status).toBe(401);
});
test('sesión vencida en MongoDB es rechazada aunque JWT siga vigente', async () => {
 await Session.updateMany({}, { expiresAt: new Date(0) });
 expect((await agent.get('/api/products')).status).toBe(401);
});
test('CRUD completo persiste modificaciones y elimina el documento', async () => {
 const list = await agent.get('/api/products'); expect(list.body.total).toBe(1);
 expect((await agent.get('/api/products/' + productId)).body.product.name).toBe('Cuaderno');
 const edit = await agent.patch('/api/products/' + productId).send({ name: 'Cuaderno A5', stock: 0 });
 expect(edit.status).toBe(200); expect(edit.body.product.stock).toBe(0); expect((await Product.findById(productId)).name).toBe('Cuaderno A5');
 expect((await agent.delete('/api/products/' + productId).send({})).status).toBe(204);
 expect(await Product.findById(productId)).toBeNull(); expect((await agent.get('/api/products/' + productId)).status).toBe(404);
});
test('otro usuario no puede listar, consultar, editar ni borrar productos ajenos', async () => {
 await other.post('/api/auth/register').send({ ...account, email: 'otro@example.com' });
 expect((await other.get('/api/products')).body.total).toBe(0);
 for (const method of ['get', 'patch', 'delete']) {
  const res = await other[method]('/api/products/' + productId).send(method === 'patch' ? { name: 'Robado' } : {});
  expect(res.status).toBe(404);
 }
 expect((await Product.findById(productId)).name).toBe(product.name);
});
test.each([{ price: -1 }, { price: 1.234 }, { stock: 0.5 }, { name: '' }, { owner: '000000000000000000000001' }, { name: { $ne: '' } }, {}])('validación de actualización %#', async body => {
 expect((await agent.patch('/api/products/' + productId).send(body)).status).toBe(400);
});
test('validación de creación y de id', async () => {
 expect((await agent.post('/api/products').send({ ...product, stock: -1 })).status).toBe(400);
 expect((await agent.get('/api/products/no-es-id')).status).toBe(400);
});
test('paginación aplica límites y aislamiento', async () => {
 await agent.post('/api/products').send({ ...product, name: 'Lápiz' });
 const res = await agent.get('/api/products?page=2&limit=1');
 expect(res.body.products).toHaveLength(1); expect(res.body.total).toBe(2); expect(res.body.pages).toBe(2);
 expect((await agent.get('/api/products?limit=1000')).status).toBe(400);
});
test('producto inexistente devuelve 404 al modificar y borrar', async () => {
 const path = '/api/products/000000000000000000000001';
 expect((await agent.patch(path).send({ name: 'No existe' })).status).toBe(404);
 expect((await agent.delete(path).send({})).status).toBe(404);
});
test('bloquea origen externo y formularios sin JSON', async () => {
 expect((await agent.post('/api/products').set('Origin', 'https://malicioso.example').send(product)).status).toBe(403);
 expect((await agent.post('/api/products').type('form').send(product)).status).toBe(415);
 expect((await agent.post('/api/products').set('Origin', process.env.APP_ORIGIN).send(product)).status).toBe(201);
});
test('JSON malformado y cuerpos grandes se rechazan', async () => {
 expect((await agent.post('/api/products').set('Content-Type', 'application/json').send('{')).status).toBe(400);
 expect((await agent.post('/api/products').send({ name: 'x'.repeat(17000) })).status).toBe(413);
});
test('servidor oculta errores internos', async () => {
 jest.spyOn(Product, 'findOne').mockRejectedValueOnce(new Error('mongodb://secreto'));
 const res = await agent.get('/api/products/' + productId);
 expect(res.status).toBe(500); expect(JSON.stringify(res.body)).not.toContain('secreto');
});
test('maneja errores de validación de Mongoose', async () => {
 jest.spyOn(Product, 'findOne').mockRejectedValueOnce(new mongoose.Error.ValidationError());
 expect((await agent.get('/api/products/' + productId)).status).toBe(400);
});
test('perfil inexistente requiere autenticación', async () => {
 await User.deleteMany({}); expect((await agent.get('/api/auth/me')).status).toBe(401);
});
test('health comprueba base de datos y manejo de indisponibilidad', async () => {
 expect((await request(app).get('/api/health')).body.database).toBe('connected');
 const broken = createApp({ connect: async () => { throw new Error('sin red'); } });
 expect((await request(broken).get('/api/health')).status).toBe(503);
 expect((await request(broken).get('/api/products')).status).toBe(503);
});
test('sirve login estático, CSP y 404', async () => {
 const res = await request(app).get('/'); expect(res.status).toBe(200); expect(res.text).toContain('Iniciar sesión');
 expect(res.headers['content-security-policy']).toContain("script-src 'self'");
 expect((await request(app).get('/no-existe')).status).toBe(404);
});
