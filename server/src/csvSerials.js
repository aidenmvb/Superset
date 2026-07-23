/**
 * Parse CSV for batch serial import.
 * Required column: serial_number (aliases: serial, sn, batch, lot, code)
 * Optional: product_name, quantity, purity, lot_code, status, notes
 */

const SERIAL_ALIASES = new Set([
  'serial_number',
  'serial',
  'sn',
  'batch',
  'batch_serial',
  'lot',
  'code',
]);

const FIELD_MAP = {
  serial_number: 'serial_number',
  serial: 'serial_number',
  sn: 'serial_number',
  batch: 'serial_number',
  batch_serial: 'serial_number',
  lot: 'serial_number',
  code: 'serial_number',
  product_name: 'product_name',
  product: 'product_name',
  compound: 'product_name',
  name: 'product_name',
  quantity: 'quantity',
  qty: 'quantity',
  amount: 'quantity',
  vial_size: 'quantity',
  purity: 'purity',
  lot_code: 'lot_code',
  lotcode: 'lot_code',
  status: 'status',
  notes: 'notes',
  note: 'notes',
  comment: 'notes',
};

function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/^\ufeff/, '')
    .replace(/\s+/g, '_');
}

/** Minimal CSV line parser supporting quoted fields. */
export function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

export function parseSerialCsv(text) {
  const raw = String(text || '').replace(/^\ufeff/, '');
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  if (lines.length === 0) {
    return { rows: [], errors: ['CSV is empty'] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const hasHeader = headers.some((h) => SERIAL_ALIASES.has(h) || FIELD_MAP[h]);

  let dataLines = lines;
  let columnKeys = [];

  if (hasHeader) {
    columnKeys = headers.map((h) => FIELD_MAP[h] || null);
    if (!columnKeys.includes('serial_number')) {
      return {
        rows: [],
        errors: [
          'CSV header must include a serial column (serial_number, serial, sn, batch, lot, or code)',
        ],
      };
    }
    dataLines = lines.slice(1);
  } else {
    // No header: treat each non-empty line as serial_number only
    // or serial_number,quantity,product_name
    return {
      rows: lines
        .map((line, idx) => {
          const cells = parseCsvLine(line);
          if (!cells[0]) return null;
          return {
            serial_number: cells[0],
            quantity: cells[1] || '',
            product_name: cells[2] || '',
            purity: cells[3] || '',
            lot_code: cells[4] || '',
            status: 'active',
            notes: '',
            _line: idx + 1,
          };
        })
        .filter(Boolean),
      errors: [],
      mode: 'headerless',
    };
  }

  const errors = [];
  const rows = [];
  dataLines.forEach((line, i) => {
    const cells = parseCsvLine(line);
    const row = {
      serial_number: '',
      product_name: '',
      quantity: '',
      purity: '',
      lot_code: '',
      status: 'active',
      notes: '',
      _line: i + 2,
    };
    columnKeys.forEach((key, colIdx) => {
      if (!key) return;
      const val = cells[colIdx] ?? '';
      row[key] = val;
    });
    if (!row.serial_number) {
      errors.push(`Line ${row._line}: missing serial_number`);
      return;
    }
    if (row.status) {
      row.status = String(row.status).toLowerCase().trim() || 'active';
    }
    rows.push(row);
  });

  return { rows, errors, mode: 'header' };
}

export function mapSerialRow(row) {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    productName: row.product_name,
    quantity: row.quantity,
    purity: row.purity,
    lotCode: row.lot_code,
    status: row.status,
    notes: row.notes,
    verifiedCount: row.verified_count,
    lastVerifiedAt: row.last_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
