import { Router } from 'express';
import db from '../db.js';
import {
  createAdminSession,
  destroyAdminSession,
  getAdminEmail,
  requireAdmin,
  verifyAdminCredentials,
} from '../adminAuth.js';
import { mapSerialRow, parseSerialCsv } from '../csvSerials.js';

const router = Router();

const upsertStmt = () =>
  db.prepare(`
    INSERT INTO batch_serials (
      serial_number, product_name, quantity, purity, lot_code, status, notes, updated_at
    ) VALUES (
      @serial_number, @product_name, @quantity, @purity, @lot_code, @status, @notes, datetime('now')
    )
    ON CONFLICT(serial_number) DO UPDATE SET
      product_name = excluded.product_name,
      quantity = excluded.quantity,
      purity = excluded.purity,
      lot_code = excluded.lot_code,
      status = excluded.status,
      notes = excluded.notes,
      updated_at = datetime('now')
  `);

function normalizeSerialInput(body = {}) {
  const serial_number = String(
    body.serialNumber || body.serial_number || body.serial || ''
  ).trim();
  return {
    serial_number,
    product_name: String(body.productName || body.product_name || '').trim(),
    quantity: String(body.quantity || body.qty || '').trim(),
    purity: String(body.purity || '').trim(),
    lot_code: String(body.lotCode || body.lot_code || '').trim(),
    status: String(body.status || 'active').trim().toLowerCase() || 'active',
    notes: String(body.notes || '').trim(),
  };
}

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!verifyAdminCredentials(email, password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const session = createAdminSession(email);
  res.json({
    token: session.token,
    expiresAt: session.expiresAt,
    email: session.email,
    message: 'Admin session created',
  });
});

router.post('/logout', requireAdmin, (req, res) => {
  destroyAdminSession(req.admin.token);
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  const count = db.prepare(`SELECT COUNT(*) AS c FROM batch_serials`).get().c;
  res.json({
    email: req.admin.email,
    expectedEmail: getAdminEmail(),
    serialCount: count,
  });
});

router.get('/serials', requireAdmin, (req, res) => {
  const q = String(req.query.q || '').trim();
  let rows;
  if (q) {
    rows = db
      .prepare(
        `SELECT * FROM batch_serials
         WHERE serial_number LIKE ? OR product_name LIKE ? OR lot_code LIKE ?
         ORDER BY created_at DESC LIMIT 500`
      )
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    rows = db
      .prepare(`SELECT * FROM batch_serials ORDER BY created_at DESC LIMIT 500`)
      .all();
  }
  res.json({ serials: rows.map(mapSerialRow), count: rows.length });
});

router.post('/serials', requireAdmin, (req, res) => {
  const row = normalizeSerialInput(req.body);
  if (!row.serial_number) {
    return res.status(400).json({ error: 'serialNumber is required' });
  }
  try {
    upsertStmt().run(row);
    const saved = db
      .prepare(`SELECT * FROM batch_serials WHERE serial_number = ? COLLATE NOCASE`)
      .get(row.serial_number);
    res.status(201).json({ serial: mapSerialRow(saved) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save serial' });
  }
});

router.post('/serials/import', requireAdmin, (req, res) => {
  const csv = req.body?.csv || req.body?.text || '';
  if (!String(csv).trim()) {
    return res.status(400).json({ error: 'csv text is required' });
  }

  const parsed = parseSerialCsv(csv);
  if (parsed.errors.length && parsed.rows.length === 0) {
    return res.status(400).json({ error: 'CSV parse failed', details: parsed.errors });
  }

  const upsert = upsertStmt();
  let imported = 0;
  const insertErrors = [...parsed.errors];

  const run = db.transaction(() => {
    for (const r of parsed.rows) {
      try {
        upsert.run({
          serial_number: r.serial_number,
          product_name: r.product_name || '',
          quantity: r.quantity || '',
          purity: r.purity || '',
          lot_code: r.lot_code || '',
          status: r.status || 'active',
          notes: r.notes || '',
        });
        imported += 1;
      } catch (err) {
        insertErrors.push(`Line ${r._line || '?'}: ${err.message}`);
      }
    }
  });

  try {
    run();
  } catch (err) {
    return res.status(500).json({ error: 'Import transaction failed', details: [err.message] });
  }

  const total = db.prepare(`SELECT COUNT(*) AS c FROM batch_serials`).get().c;
  res.json({
    imported,
    parseMode: parsed.mode,
    warnings: insertErrors,
    totalSerials: total,
    message: `Imported ${imported} serial number(s).`,
  });
});

router.delete('/serials/:serial', requireAdmin, (req, res) => {
  const result = db
    .prepare(`DELETE FROM batch_serials WHERE serial_number = ? COLLATE NOCASE`)
    .run(req.params.serial);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Serial not found' });
  }
  res.json({ ok: true, deleted: req.params.serial });
});

router.get('/docs', requireAdmin, (_req, res) => {
  res.json({
    title: 'Batch serial CSV documentation',
    login: {
      email: getAdminEmail(),
      path: '/admin',
    },
    csv: {
      requiredColumn: 'serial_number',
      aliases: {
        serial_number: ['serial', 'sn', 'batch', 'lot', 'code'],
        product_name: ['product', 'compound', 'name'],
        quantity: ['qty', 'amount', 'vial_size'],
        purity: ['purity'],
        lot_code: ['lot_code', 'lotcode'],
        status: ['status'],
        notes: ['notes', 'note', 'comment'],
      },
      example: `serial_number,product_name,quantity,purity,lot_code,status,notes
VR-24S-1187,Semax,5mg,99.4%,VR-24S-1187,active,HPLC + MS verified
VR-24N-0552,BPC-157,5mg,99.1%,VR-24N-0552,active,Endotoxin pass
VR-24P-0901,TB-500,5mg,98.9%,VR-24P-0901,active,`,
      headerless: `VR-24S-1187,5mg,Semax
VR-24N-0552,10mg,BPC-157`,
      notes: [
        'Header row is optional. If omitted, columns are: serial_number, quantity, product_name, purity, lot_code.',
        'Duplicate serial_number values update (upsert) the existing row.',
        'status defaults to active. Use inactive or recalled to invalidate a serial for public verify.',
        'Public verify: POST /api/batches/verify with { "serialNumber": "..." } or GET /api/batches/verify/:serial',
        'Quantity is free text (e.g. 5mg, 10 vials) so it matches packaging labels.',
      ],
    },
  });
});

export default router;
