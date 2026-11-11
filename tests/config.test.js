const config = require('../src/config');
const saved = { ...process.env };
beforeEach(() => { process.env = { ...saved, MONGODB_URI: 'mongodb://localhost/test', JWT_SECRET: 'x'.repeat(32), APP_ORIGIN: 'http://localhost:3000', NODE_ENV: 'test' }; });
afterAll(() => { process.env = saved; });
test('exige URI, secreto fuerte y origen', () => {
 delete process.env.MONGODB_URI; expect(config).toThrow('MONGODB_URI'); process.env.MONGODB_URI = 'mongodb://localhost/test';
 process.env.JWT_SECRET = 'corto'; expect(config).toThrow('JWT_SECRET'); process.env.JWT_SECRET = 'x'.repeat(32);
 process.env.APP_ORIGIN = 'incorrecto'; expect(config).toThrow('APP_ORIGIN');
});
test('producción requiere HTTPS', () => { process.env.NODE_ENV = 'production'; expect(config).toThrow('HTTPS'); process.env.APP_ORIGIN = 'https://folio.example'; expect(config().production).toBe(true); });
