const { z } = require('zod');
const fields = { name: z.string().trim().min(1).max(120), description: z.string().trim().max(2000), price: z.number().min(0).max(100000000).refine(n => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001, 'Máximo dos decimales'), stock: z.number().int().min(0).max(1000000) };
const schemas = {
 register: z.object({ name: z.string().trim().min(2).max(80), email: z.email().max(254).transform(s => s.toLowerCase()), password: z.string().min(12).max(72).refine(s => Buffer.byteLength(s, 'utf8') <= 72, 'Máximo 72 bytes') }).strict(),
 login: z.object({ email: z.email().max(254).transform(s => s.toLowerCase()), password: z.string().min(1).max(72) }).strict(),
 product: z.object({ ...fields, description: fields.description.default('') }).strict(),
 update: z.object(fields).partial().strict().refine(o => Object.keys(o).length > 0, 'Incluye al menos un campo'),
 pagination: z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }).strict()
};
function validate(name, source = 'body') {
 return (req, res, next) => {
  const parsed = schemas[name].safeParse(req[source]);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  if (source === 'query') req.pagination = parsed.data; else req.body = parsed.data;
  next();
 };
}
module.exports = { validate, schemas };
