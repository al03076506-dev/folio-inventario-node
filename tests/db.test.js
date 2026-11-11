process.env.MONGODB_URI = 'mongodb://localhost/test';
process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters';
process.env.APP_ORIGIN = 'http://localhost:3000';
jest.mock('mongoose', () => ({ connection: { readyState: 0 }, connect: jest.fn() }));
const mongoose = require('mongoose');
beforeEach(() => { jest.resetModules(); });
test('reutiliza conexión ya abierta', async () => {
 const m = require('mongoose'); m.connection.readyState = 1;
 await require('../src/db')(); expect(m.connect).not.toHaveBeenCalled();
});
test('comparte promesa entre conexiones concurrentes', async () => {
 const m = require('mongoose'); m.connection.readyState = 0; m.connect.mockResolvedValue({});
 const connect = require('../src/db'); await Promise.all([connect(), connect()]); expect(m.connect).toHaveBeenCalledTimes(1);
});
test('reintenta después de un fallo', async () => {
 const m = require('mongoose'); m.connection.readyState = 0; m.connect.mockRejectedValueOnce(new Error('red')).mockResolvedValueOnce({});
 const connect = require('../src/db'); await expect(connect()).rejects.toThrow('red'); await connect(); expect(m.connect).toHaveBeenCalledTimes(2);
});
