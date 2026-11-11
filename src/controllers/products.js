const Product = require('../models/Product');
const filter = req => ({ _id: req.params.id, owner: req.userId });
exports.list = async (req, res) => {
 const { page, limit } = req.pagination;
 const query = { owner: req.userId };
 const [products, total] = await Promise.all([Product.find(query).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit), Product.countDocuments(query)]);
 res.json({ products, total, page, pages: Math.ceil(total / limit) });
};
exports.create = async (req, res) => res.status(201).json({ product: await Product.create({ ...req.body, owner: req.userId }) });
exports.get = async (req, res) => {
 const product = await Product.findOne(filter(req));
 if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
 res.json({ product });
};
exports.update = async (req, res) => {
 const product = await Product.findOneAndUpdate(filter(req), { $set: req.body }, { new: true, runValidators: true });
 if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
 res.json({ product });
};
exports.remove = async (req, res) => {
 const product = await Product.findOneAndDelete(filter(req));
 if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
 res.status(204).end();
};
