import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cloud Run filesystem is read-only except /tmp — default there in production
const defaultDataDir =
  process.env.NODE_ENV === 'production'
    ? '/tmp/superset-data'
    : path.join(__dirname, '..', 'data');

const dataDir = process.env.DB_DIR || defaultDataDir;
const dbPath = process.env.DB_PATH || path.join(dataDir, 'superset.db');

const dbParent = path.dirname(dbPath);
if (!fs.existsSync(dbParent)) {
  fs.mkdirSync(dbParent, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function columnExists(table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

function ensureColumn(table, column, definition) {
  if (!columnExists(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      short_description TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      purity TEXT NOT NULL DEFAULT '≥98%',
      form TEXT NOT NULL DEFAULT 'Lyophilized powder',
      molecular_weight TEXT,
      sequence TEXT,
      cas_number TEXT,
      price_cents INTEGER NOT NULL,
      vial_size TEXT NOT NULL DEFAULT '5mg',
      stock INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      image_color TEXT NOT NULL DEFAULT '#0d9488',
      application_route TEXT NOT NULL DEFAULT 'injectable',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_state TEXT NOT NULL,
      shipping_zip TEXT NOT NULL,
      shipping_country TEXT NOT NULL DEFAULT 'US',
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      stripe_payment_intent_id TEXT,
      subtotal_cents INTEGER NOT NULL,
      shipping_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL,
      research_use_ack INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      vial_size TEXT NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total_cents INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS batch_serials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      product_name TEXT NOT NULL DEFAULT '',
      quantity TEXT NOT NULL DEFAULT '',
      purity TEXT NOT NULL DEFAULT '',
      lot_code TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT NOT NULL DEFAULT '',
      verified_count INTEGER NOT NULL DEFAULT 0,
      last_verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testing_labs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT 'US',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      services TEXT NOT NULL DEFAULT '',
      turnaround TEXT NOT NULL DEFAULT '',
      accepts_shipments INTEGER NOT NULL DEFAULT 1,
      is_partner INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS test_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lab_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      compound_name TEXT NOT NULL DEFAULT '',
      lot_or_serial TEXT NOT NULL DEFAULT '',
      test_types TEXT NOT NULL DEFAULT '',
      quantity TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      shipping_city TEXT NOT NULL DEFAULT '',
      shipping_state TEXT NOT NULL DEFAULT '',
      shipping_zip TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'submitted',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (lab_id) REFERENCES testing_labs(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      org_name TEXT NOT NULL DEFAULT '',
      research_use_ack INTEGER NOT NULL DEFAULT 0,
      age_confirmed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL DEFAULT 'Shipping',
      name TEXT NOT NULL DEFAULT '',
      line1 TEXT NOT NULL,
      line2 TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'US',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migrate DBs created before payment columns existed
  ensureColumn('orders', 'payment_status', "TEXT NOT NULL DEFAULT 'unpaid'");
  ensureColumn('orders', 'stripe_payment_intent_id', 'TEXT');
  ensureColumn('orders', 'user_id', 'INTEGER');
  ensureColumn('products', 'application_route', "TEXT NOT NULL DEFAULT 'injectable'");

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_pi
      ON orders(stripe_payment_intent_id)
      WHERE stripe_payment_intent_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_batch_serials_status
      ON batch_serials(status);
    CREATE INDEX IF NOT EXISTS idx_products_application_route
      ON products(application_route);
    CREATE INDEX IF NOT EXISTS idx_testing_labs_state_city
      ON testing_labs(state, city);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user
      ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_addresses_user
      ON user_addresses(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user
      ON orders(user_id);
  `);
}

export default db;
