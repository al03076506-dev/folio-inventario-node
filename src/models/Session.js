const mongoose = require('mongoose');
module.exports = mongoose.model('Session', new mongoose.Schema({
 _id: { type: String, required: true },
 user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 expiresAt: { type: Date, required: true, expires: 0 }
}, { timestamps: true }));
