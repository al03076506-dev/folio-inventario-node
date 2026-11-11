const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('node:path');
const config = require('./config');
const connectDB = require('./db');
module.exports = function createApp({ connect = connectDB } = {}) {
 const app = express();
 app.disable('x-powered-by');
 app.use(helmet({ strictTransportSecurity: config().production ? undefined : false, contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': config().production ? [] : null } } }));
 app.use(express.json({ limit: '16kb' }));
 app.use(cookieParser());
 app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
   if (req.get('Origin') && req.get('Origin') !== config().origin) return res.status(403).json({ error: 'Origen no autorizado' });
   if (!req.is('application/json')) return res.status(415).json({ error: 'Usa Content-Type application/json' });
  }
  next();
 });
 app.get('/api/health', async (req, res) => {
  try { await connect(); res.json({ status: 'ok', database: 'connected' }); }
  catch { res.status(503).json({ status: 'unavailable', database: 'disconnected' }); }
 });
 app.use('/api', async (req, res, next) => { try { await connect(); next(); } catch { res.status(503).json({ error: 'Base de datos no disponible' }); } });
 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/products', require('./routes/products'));
 app.use(express.static(path.join(__dirname, '../public')));
 app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
 app.use((err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ error: 'El correo ya está registrado' });
  if (err.name === 'ValidationError' || err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Datos inválidos' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande' });
  if (process.env.NODE_ENV !== 'test') console.error('request_failed', err.name);
  res.status(500).json({ error: 'Error interno del servidor' });
 });
 return app;
};
