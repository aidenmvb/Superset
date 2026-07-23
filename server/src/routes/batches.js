import { Router } from 'express';
import db from '../db.js';
import { mapSerialRow } from '../csvSerials.js';

const router = Router();

/**
 * Public: verify a serial / batch number from the live SQLite table.
 * GET /api/batches/verify/:serial
 * POST /api/batches/verify { serialNumber }
 */
function verifySerial(serialRaw, res) {
  const serial = String(serialRaw || '').trim();
  if (!serial) {
    return res.status(400).json({
      valid: false,
      error: 'serialNumber is required',
    });
  }

  const row = db
    .prepare(
      `SELECT * FROM batch_serials WHERE serial_number = ? COLLATE NOCASE`
    )
    .get(serial);

  if (!row) {
    return res.status(404).json({
      valid: false,
      serialNumber: serial,
      message: 'Serial number not found. Check the code on your vial or packaging.',
    });
  }

  if (String(row.status).toLowerCase() !== 'active') {
    return res.status(410).json({
      valid: false,
      serialNumber: row.serial_number,
      status: row.status,
      message: `This serial is marked “${row.status}” and is not valid for use.`,
      batch: mapSerialRow(row),
    });
  }

  db.prepare(
    `UPDATE batch_serials
     SET verified_count = verified_count + 1,
         last_verified_at = datetime('now'),
         updated_at = datetime('now')
     WHERE id = ?`
  ).run(row.id);

  const updated = db.prepare(`SELECT * FROM batch_serials WHERE id = ?`).get(row.id);

  return res.json({
    valid: true,
    message: 'Serial verified. This batch is registered in the Vireon system.',
    batch: mapSerialRow(updated),
  });
}

router.get('/verify/:serial', (req, res) => {
  verifySerial(req.params.serial, res);
});

router.post('/verify', (req, res) => {
  const serial = req.body?.serialNumber || req.body?.serial || req.body?.code;
  verifySerial(serial, res);
});

export default router;
