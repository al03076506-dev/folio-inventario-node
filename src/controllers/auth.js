const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const config = require('../config');
const publicUser = u => ({ id: u.id, name: u.name, email: u.email });
const cookieOptions = () => ({ httpOnly: true, secure: config().production, sameSite: 'strict', path: '/' });
async function issue(user, res, status) {
 const jti = randomUUID();
 await Session.create({ _id: jti, user: user._id, expiresAt: new Date(Date.now() + 3600000) });
 const token = jwt.sign({}, config().secret, { subject: user.id, jwtid: jti, expiresIn: '1h', algorithm: 'HS256', issuer: 'inventario', audience: 'inventario-web' });
 res.cookie('token', token, { ...cookieOptions(), maxAge: 3600000 });
 return res.status(status).json({ user: publicUser(user) });
}
exports.register = async (req, res) => {
 const { name, email, password } = req.body;
 const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
 return issue(user, res, 201);
};
exports.login = async (req, res) => {
 const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
 const valid = await bcrypt.compare(req.body.password, user?.passwordHash || '$2b$12$abcdefghijklmnopqrstuuZtpdlywgD2MLmD1CwAqp1E2IP7eM5Ma');
 if (!user || !valid) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
 return issue(user, res, 200);
};
exports.me = async (req, res) => {
 const user = await User.findById(req.userId);
 if (!user) return res.status(401).json({ error: 'Usuario inexistente' });
 res.json({ user: publicUser(user) });
};
exports.logout = async (req, res) => {
 await Session.deleteOne({ _id: req.sessionId });
 res.clearCookie('token', cookieOptions()).status(204).end();
};
