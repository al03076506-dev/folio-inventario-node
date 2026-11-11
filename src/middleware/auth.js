const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const config = require('../config');
module.exports = async function auth(req, res, next) {
 const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : req.cookies.token;
 if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar' });
 let payload;
 try { payload = jwt.verify(token, config().secret, { algorithms: ['HS256'], issuer: 'inventario', audience: 'inventario-web' }); }
 catch { return res.status(401).json({ error: 'Sesión inválida o expirada' }); }
 const session = await Session.findOne({ _id: payload.jti, user: payload.sub, expiresAt: { $gt: new Date() } });
 if (!session) return res.status(401).json({ error: 'Sesión inválida o expirada' });
 req.userId = payload.sub; req.sessionId = payload.jti;
 next();
};
