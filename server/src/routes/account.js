import { Router } from 'express';
import db from '../db.js';
import { requireUser } from '../userAuth.js';
import { getOrderItems, mapOrder } from '../orderService.js';

const router = Router();
router.use(requireUser);

function mapAddress(row) {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    line1: row.line1,
    line2: row.line2 || '',
    city: row.city,
    state: row.state,
    zip: row.zip,
    country: row.country || 'US',
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/orders', (req, res) => {
  const rows = db
    .prepare(
      `
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `
    )
    .all(req.user.id);

  res.json({
    orders: rows.map((o) => mapOrder(o, getOrderItems(o.id))),
    count: rows.length,
  });
});

router.get('/orders/:orderNumber', (req, res) => {
  const order = db
    .prepare(`SELECT * FROM orders WHERE order_number = ? AND user_id = ?`)
    .get(req.params.orderNumber, req.user.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  res.json({ order: mapOrder(order, getOrderItems(order.id)) });
});

router.get('/addresses', (req, res) => {
  const rows = db
    .prepare(
      `
      SELECT * FROM user_addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, updated_at DESC
    `
    )
    .all(req.user.id);
  res.json({ addresses: rows.map(mapAddress), count: rows.length });
});

router.post('/addresses', (req, res) => {
  const { label, name, line1, line2, city, state, zip, country, isDefault } =
    req.body || {};

  const errors = [];
  if (!String(line1 || '').trim()) errors.push('Address line is required');
  if (!String(city || '').trim()) errors.push('City is required');
  if (!String(state || '').trim()) errors.push('State is required');
  if (!String(zip || '').trim()) errors.push('ZIP is required');
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const makeDefault = Boolean(isDefault);
  const insert = db.transaction(() => {
    if (makeDefault) {
      db.prepare(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`).run(
        req.user.id
      );
    }
    const existingCount = db
      .prepare(`SELECT COUNT(*) AS c FROM user_addresses WHERE user_id = ?`)
      .get(req.user.id).c;
    const defaultFlag = makeDefault || existingCount === 0 ? 1 : 0;

    const result = db
      .prepare(
        `
        INSERT INTO user_addresses (
          user_id, label, name, line1, line2, city, state, zip, country, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        req.user.id,
        String(label || 'Shipping').trim(),
        String(name || req.user.name || '').trim(),
        String(line1).trim(),
        String(line2 || '').trim(),
        String(city).trim(),
        String(state).trim(),
        String(zip).trim(),
        String(country || 'US').trim(),
        defaultFlag
      );
    return result.lastInsertRowid;
  });

  const id = insert();
  const row = db.prepare(`SELECT * FROM user_addresses WHERE id = ?`).get(id);
  res.status(201).json({ address: mapAddress(row) });
});

router.patch('/addresses/:id', (req, res) => {
  const row = db
    .prepare(`SELECT * FROM user_addresses WHERE id = ? AND user_id = ?`)
    .get(Number(req.params.id), req.user.id);
  if (!row) return res.status(404).json({ error: 'Address not found.' });

  const { label, name, line1, line2, city, state, zip, country, isDefault } =
    req.body || {};

  const update = db.transaction(() => {
    if (isDefault) {
      db.prepare(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`).run(
        req.user.id
      );
    }
    db.prepare(
      `
      UPDATE user_addresses SET
        label = ?,
        name = ?,
        line1 = ?,
        line2 = ?,
        city = ?,
        state = ?,
        zip = ?,
        country = ?,
        is_default = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `
    ).run(
      label !== undefined ? String(label).trim() : row.label,
      name !== undefined ? String(name).trim() : row.name,
      line1 !== undefined ? String(line1).trim() : row.line1,
      line2 !== undefined ? String(line2).trim() : row.line2,
      city !== undefined ? String(city).trim() : row.city,
      state !== undefined ? String(state).trim() : row.state,
      zip !== undefined ? String(zip).trim() : row.zip,
      country !== undefined ? String(country).trim() : row.country,
      isDefault !== undefined ? (isDefault ? 1 : 0) : row.is_default,
      row.id
    );
  });
  update();

  const next = db.prepare(`SELECT * FROM user_addresses WHERE id = ?`).get(row.id);
  res.json({ address: mapAddress(next) });
});

router.delete('/addresses/:id', (req, res) => {
  const row = db
    .prepare(`SELECT * FROM user_addresses WHERE id = ? AND user_id = ?`)
    .get(Number(req.params.id), req.user.id);
  if (!row) return res.status(404).json({ error: 'Address not found.' });

  db.prepare(`DELETE FROM user_addresses WHERE id = ?`).run(row.id);
  if (row.is_default) {
    const next = db
      .prepare(
        `SELECT id FROM user_addresses WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`
      )
      .get(req.user.id);
    if (next) {
      db.prepare(`UPDATE user_addresses SET is_default = 1 WHERE id = ?`).run(next.id);
    }
  }
  res.json({ ok: true });
});

export default router;
