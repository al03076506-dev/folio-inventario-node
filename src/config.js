require('dotenv').config({ quiet: true });
module.exports = function config() {
 const { MONGODB_URI, JWT_SECRET, APP_ORIGIN, NODE_ENV } = process.env;
 if (!MONGODB_URI) throw new Error('Falta MONGODB_URI');
 if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
 if (!APP_ORIGIN || !/^https?:\/\//.test(APP_ORIGIN)) throw new Error('APP_ORIGIN debe ser una URL HTTP(S)');
 if (NODE_ENV === 'production' && !APP_ORIGIN.startsWith('https://')) throw new Error('Producción requiere HTTPS');
 return { mongoUri: MONGODB_URI, secret: JWT_SECRET, origin: new URL(APP_ORIGIN).origin, production: NODE_ENV === 'production' };
};
