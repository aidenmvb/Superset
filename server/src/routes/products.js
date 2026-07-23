import { Router } from 'express';
import db from '../db.js';

const router = Router();

function routeLabel(route) {
  switch (String(route || '').toLowerCase()) {
    case 'topical':
      return 'Topical / apply';
    case 'nasal':
      return 'Nasal';
    case 'injectable':
    default:
      return 'Injectable research';
  }
}

function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    shortDescription: row.short_description,
    description: row.description,
    purity: row.purity,
    form: row.form,
    molecularWeight: row.molecular_weight,
    sequence: row.sequence,
    casNumber: row.cas_number,
    priceCents: row.price_cents,
    price: row.price_cents / 100,
    vialSize: row.vial_size,
    stock: row.stock,
    isFeatured: Boolean(row.is_featured),
    imageColor: row.image_color,
    applicationRoute: row.application_route || 'injectable',
    applicationLabel: routeLabel(row.application_route || 'injectable'),
    inStock: row.stock > 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const productSelect = `
  SELECT
    p.*,
    c.slug AS category_slug,
    c.name AS category_name
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

router.get('/routes', (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT application_route AS route, COUNT(*) AS count
      FROM products
      GROUP BY application_route
      ORDER BY
        CASE application_route
          WHEN 'injectable' THEN 1
          WHEN 'topical' THEN 2
          WHEN 'nasal' THEN 3
          ELSE 4
        END
    `
    )
    .all();

  res.json({
    routes: rows.map((r) => ({
      slug: r.route || 'injectable',
      label: routeLabel(r.route || 'injectable'),
      count: r.count,
    })),
  });
});

router.get('/', (req, res) => {
  const { category, featured, q, inStock, application, route } = req.query;
  const clauses = [];
  const params = {};

  if (category) {
    clauses.push('c.slug = @category');
    params.category = category;
  }
  const appRoute = application || route;
  if (appRoute) {
    clauses.push('p.application_route = @application');
    params.application = String(appRoute).toLowerCase();
  }
  if (featured === 'true' || featured === '1') {
    clauses.push('p.is_featured = 1');
  }
  if (inStock === 'true' || inStock === '1') {
    clauses.push('p.stock > 0');
  }
  if (q && String(q).trim()) {
    clauses.push(
      `(p.name LIKE @q OR p.short_description LIKE @q OR p.description LIKE @q OR p.cas_number LIKE @q)`
    );
    params.q = `%${String(q).trim()}%`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `${productSelect} ${where} ORDER BY
        CASE p.application_route
          WHEN 'injectable' THEN 1
          WHEN 'topical' THEN 2
          WHEN 'nasal' THEN 3
          ELSE 4
        END,
        p.is_featured DESC,
        p.name ASC`
    )
    .all(params);

  res.json({ products: rows.map(mapProduct), count: rows.length });
});

router.get('/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const isNumeric = /^\d+$/.test(idOrSlug);
  const row = isNumeric
    ? db.prepare(`${productSelect} WHERE p.id = ?`).get(Number(idOrSlug))
    : db.prepare(`${productSelect} WHERE p.slug = ?`).get(idOrSlug);

  if (!row) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product: mapProduct(row) });
});

export default router;
