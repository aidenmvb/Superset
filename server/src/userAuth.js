import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import db from './db.js';

const SCRYPT_KEYLEN = 64;

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, SCRYPT_KEYLEN).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !String(stored).includes(':')) return false;
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const next = scryptSync(String(password), salt, SCRYPT_KEYLEN);
  const prev = Buffer.from(hash, 'hex');
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

export function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name || '',
    phone: row.phone || '',
    orgName: row.org_name || '',
    researchUseAck: Boolean(row.research_use_ack),
    ageConfirmed: Boolean(row.age_confirmed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function findUserByEmail(email) {
  return db
    .prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE')
    .get(String(email || '').trim().toLowerCase());
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id));
}

export function createUserSession(userId) {
  const token = randomBytes(32).toString('hex');
  const days = Number(process.env.USER_SESSION_DAYS) || 30;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO user_sessions (token, user_id, expires_at) VALUES (?, ?, ?)`
  ).run(token, userId, expires);
  return { token, expiresAt: expires };
}

export function destroyUserSession(token) {
  if (!token) return;
  db.prepare(`DELETE FROM user_sessions WHERE token = ?`).run(token);
}

export function getUserSession(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `
      SELECT s.token, s.expires_at, u.*
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
    `
    )
    .get(token);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroyUserSession(token);
    return null;
  }
  return row;
}

export function extractBearer(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return String(req.headers['x-user-token'] || '').trim();
}

export function requireUser(req, res, next) {
  const token = extractBearer(req);
  const session = getUserSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  req.user = mapUser(session);
  req.userToken = token;
  next();
}

/** Optional auth — attaches user if token valid, never blocks. */
export function optionalUser(req, _res, next) {
  const token = extractBearer(req);
  const session = getUserSession(token);
  if (session) {
    req.user = mapUser(session);
    req.userToken = token;
  }
  next();
}
