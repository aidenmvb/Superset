import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initSchema } from './db.js';
import { ensureApplicationCatalog, seedDatabase } from './seed.js';
import { ensureTestingLabs } from './seedLabs.js';
import { getPublishableKey, isLiveMode, stripe } from './stripeClient.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import contactRouter from './routes/contact.js';
import paymentsRouter from './routes/payments.js';
import webhooksRouter from './routes/webhooks.js';
import batchesRouter from './routes/batches.js';
import adminRouter from './routes/admin.js';
import labsRouter from './routes/labs.js';
import authRouter from './routes/auth.js';
import accountRouter from './routes/account.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initSchema();

const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (productCount === 0) {
  console.log('No products found — seeding database…');
  const result = seedDatabase();
  console.log(result.message, result.counts);
} else {
  const extended = ensureApplicationCatalog();
  if (extended.added) {
    console.log(`Catalog extended with ${extended.added} topical/nasal products`);
  }
}

const labsSeed = ensureTestingLabs();
if (!labsSeed.skipped) {
  console.log(`Seeded ${labsSeed.count} testing labs`);
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigins = new Set(
  [
    CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.CORS_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ].filter(Boolean)
);

// Stripe webhooks need the raw body for signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isProd) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const stats = {
    products: db.prepare('SELECT COUNT(*) AS c FROM products').get().c,
    categories: db.prepare('SELECT COUNT(*) AS c FROM categories').get().c,
    orders: db.prepare('SELECT COUNT(*) AS c FROM orders').get().c,
    serials: db.prepare('SELECT COUNT(*) AS c FROM batch_serials').get().c,
    testingLabs: db.prepare('SELECT COUNT(*) AS c FROM testing_labs').get().c,
    testRequests: db.prepare('SELECT COUNT(*) AS c FROM test_requests').get().c,
  };
  res.json({
    ok: true,
    service: 'superset-api',
    database: 'sqlite',
    environment: process.env.NODE_ENV || 'development',
    stripe: {
      configured: Boolean(stripe && getPublishableKey()),
      liveMode: isLiveMode(),
    },
    stats,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/batches', batchesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/labs', labsRouter);
app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);

// Serve React production build (same origin as API on Cloud Run)
const clientDist = process.env.CLIENT_DIST || path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { index: false, maxAge: isProd ? '1h' : 0 }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`Serving frontend from ${clientDist}`);
} else {
  console.log(`No frontend build at ${clientDist} — API-only mode`);
}

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.message?.startsWith('CORS') ? 403 : 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Superset listening on http://0.0.0.0:${PORT}`);
  console.log(`Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(
    `Stripe: ${stripe ? (isLiveMode() ? 'LIVE mode' : 'test mode') : 'NOT CONFIGURED'}`
  );
});
