import { Router } from 'express';
import db from '../db.js';

const router = Router();

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Haversine distance in miles */
export function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function mapLab(row, distance = null) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    country: row.country,
    lat: row.lat,
    lng: row.lng,
    phone: row.phone,
    email: row.email,
    website: row.website,
    services: row.services,
    turnaround: row.turnaround,
    acceptsShipments: Boolean(row.accepts_shipments),
    isPartner: Boolean(row.is_partner),
    distanceMiles: distance != null ? Math.round(distance * 10) / 10 : null,
    fullAddress: [row.address, row.city, row.state, row.zip].filter(Boolean).join(', '),
  };
}

router.get('/', (req, res) => {
  const { state, q, city } = req.query;
  const clauses = [];
  const params = {};
  if (state) {
    clauses.push('state = @state');
    params.state = String(state).toUpperCase();
  }
  if (city) {
    clauses.push('city LIKE @city');
    params.city = `%${String(city).trim()}%`;
  }
  if (q && String(q).trim()) {
    clauses.push(
      `(name LIKE @q OR city LIKE @q OR state LIKE @q OR zip LIKE @q OR services LIKE @q)`
    );
    params.q = `%${String(q).trim()}%`;
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM testing_labs ${where} ORDER BY state ASC, city ASC, name ASC`)
    .all(params);
  res.json({ labs: rows.map((r) => mapLab(r)), count: rows.length });
});

/**
 * Nearby labs by lat/lng (browser geolocation or geocoded zip).
 * GET /api/labs/nearby?lat=30.27&lng=-97.74&radius=500&limit=20
 */
router.get('/nearby', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius) || 500;
  const limit = Math.min(Number(req.query.limit) || 15, 50);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({
      error: 'lat and lng are required (from geolocation or ZIP lookup)',
    });
  }

  const rows = db.prepare(`SELECT * FROM testing_labs`).all();
  const withDistance = rows
    .map((row) => {
      const d = distanceMiles(lat, lng, row.lat, row.lng);
      return mapLab(row, d);
    })
    .filter((lab) => lab.distanceMiles <= radius)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);

  res.json({
    labs: withDistance,
    count: withDistance.length,
    origin: { lat, lng },
    radiusMiles: radius,
  });
});

/**
 * Lightweight ZIP → lat/lng using lab ZIP matches first, then free Nominatim.
 * GET /api/labs/geocode?zip=78701
 */
router.get('/geocode', async (req, res) => {
  const zip = String(req.query.zip || '').trim();
  if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    return res.status(400).json({ error: 'Provide a valid 5-digit US ZIP code' });
  }
  const zip5 = zip.slice(0, 5);

  // Prefer coordinates from a lab already in the same ZIP
  const local = db
    .prepare(`SELECT lat, lng, city, state FROM testing_labs WHERE zip = ? LIMIT 1`)
    .get(zip5);
  if (local) {
    return res.json({
      lat: local.lat,
      lng: local.lng,
      city: local.city,
      state: local.state,
      zip: zip5,
      source: 'lab-network',
    });
  }

  // Nearby ZIP: same first 3 digits
  const prefix = zip5.slice(0, 3);
  const near = db
    .prepare(`SELECT lat, lng, city, state, zip FROM testing_labs WHERE zip LIKE ? LIMIT 1`)
    .get(`${prefix}%`);
  if (near) {
    return res.json({
      lat: near.lat,
      lng: near.lng,
      city: near.city,
      state: near.state,
      zip: zip5,
      source: 'approx-network',
      note: `Approximate from network lab in ${near.zip}`,
    });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip5)}&country=US&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VireonResearchStore/1.0 (peptide testing lab finder)',
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Geocoding service unavailable' });
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: 'ZIP code not found' });
    }
    return res.json({
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
      zip: zip5,
      displayName: data[0].display_name,
      source: 'nominatim',
    });
  } catch (err) {
    console.error('geocode failed', err);
    return res.status(502).json({ error: 'Failed to geocode ZIP' });
  }
});

router.get('/:id', (req, res) => {
  const isNum = /^\d+$/.test(req.params.id);
  const row = isNum
    ? db.prepare(`SELECT * FROM testing_labs WHERE id = ?`).get(Number(req.params.id))
    : db.prepare(`SELECT * FROM testing_labs WHERE slug = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Lab not found' });
  res.json({ lab: mapLab(row) });
});

/**
 * Submit a request to send peptides for testing at a lab.
 * POST /api/labs/test-requests
 */
router.post('/test-requests', (req, res) => {
  const {
    labId,
    customerName,
    customerEmail,
    customerPhone,
    compoundName,
    lotOrSerial,
    testTypes,
    quantity,
    notes,
    shippingCity,
    shippingState,
    shippingZip,
  } = req.body || {};

  const errors = [];
  if (!customerName?.trim()) errors.push('customerName is required');
  if (!customerEmail?.trim()) errors.push('customerEmail is required');
  if (!compoundName?.trim()) errors.push('compoundName is required');
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  let lab = null;
  if (labId) {
    lab = db.prepare(`SELECT * FROM testing_labs WHERE id = ?`).get(Number(labId));
    if (!lab) {
      return res.status(400).json({ error: 'Selected lab not found' });
    }
  }

  const result = db
    .prepare(
      `
      INSERT INTO test_requests (
        lab_id, customer_name, customer_email, customer_phone,
        compound_name, lot_or_serial, test_types, quantity, notes,
        shipping_city, shipping_state, shipping_zip, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
    `
    )
    .run(
      lab?.id ?? null,
      customerName.trim(),
      customerEmail.trim().toLowerCase(),
      customerPhone?.trim() || null,
      compoundName.trim(),
      lotOrSerial?.trim() || '',
      Array.isArray(testTypes) ? testTypes.join(', ') : String(testTypes || 'HPLC purity, MS identity'),
      quantity?.trim() || '',
      notes?.trim() || '',
      shippingCity?.trim() || '',
      shippingState?.trim() || '',
      shippingZip?.trim() || ''
    );

  res.status(201).json({
    id: Number(result.lastInsertRowid),
    status: 'submitted',
    message: lab
      ? `Test request submitted for ${lab.name}. Our team will follow up with shipping instructions.`
      : 'Test request submitted. Our team will match you with a partner lab and follow up.',
    lab: lab ? mapLab(lab) : null,
  });
});

export default router;
