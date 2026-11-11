const mongoose = require('mongoose');
module.exports = mongoose.model('Product', new mongoose.Schema({
 owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 name: { type: String, required: true, trim: true, maxlength: 120 },
 description: { type: String, default: '', maxlength: 2000 },
 price: { type: Number, required: true, min: 0, max: 100000000 },
 stock: { type: Number, required: true, min: 0, max: 1000000, validate: Number.isInteger }
}, { timestamps: true }));
