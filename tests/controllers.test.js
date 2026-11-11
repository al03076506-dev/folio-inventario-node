process.env.JWT_SECRET = 'test-only-secret-with-more-than-32-characters';
process.env.MONGODB_URI = 'mongodb://localhost/test';
process.env.APP_ORIGIN = 'http://localhost:3000';
jest.mock('../src/models/Product');
const Product = require('../src/models/Product');
const c = require('../src/controllers/products');
let res;
beforeEach(() => { jest.clearAllMocks(); res = { status: jest.fn().mockReturnThis(), json: jest.fn(), end: jest.fn() }; });
test('controlador crea producto vinculado al usuario autenticado', async () => {
 const req = { userId: 'dueño', body: { name: 'Lápiz', price: 2, stock: 4 } };
 Product.create.mockResolvedValue({ _id: 'nuevo' }); await c.create(req, res);
 expect(Product.create).toHaveBeenCalledWith({ ...req.body, owner: 'dueño' }); expect(res.status).toHaveBeenCalledWith(201);
});
test.each(['get', 'update', 'remove'])('%s filtra por propietario e id', async method => {
 const modelMethod = { get: 'findOne', update: 'findOneAndUpdate', remove: 'findOneAndDelete' }[method];
 Product[modelMethod].mockResolvedValue(null);
 await c[method]({ userId: 'dueño', params: { id: 'id' }, body: { stock: 1 } }, res);
 expect(Product[modelMethod].mock.calls[0][0]).toEqual({ _id: 'id', owner: 'dueño' }); expect(res.status).toHaveBeenCalledWith(404);
});
test('propaga fallos de persistencia al manejador de Express', async () => {
 Product.create.mockRejectedValue(new Error('offline'));
 await expect(c.create({ userId: 'u', body: {} }, res)).rejects.toThrow('offline');
});
