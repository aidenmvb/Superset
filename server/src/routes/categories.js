import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT
        c.id,
        c.slug,
        c.name,
        c.description,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `
    )
    .all();

  res.json({
    categories: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      productCount: row.product_count,
    })),
  });
});

router.get('/:slug', (req, res) => {
  const row = db
    .prepare(
      `
      SELECT
        c.id,
        c.slug,
        c.name,
        c.description,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.slug = ?
      GROUP BY c.id
    `
    )
    .get(req.params.slug);

  if (!row) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({
    category: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      productCount: row.product_count,
    },
  });
});

export default router;
