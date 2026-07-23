import { randomBytes, timingSafeEqual } from 'crypto';
import db from './db.js';

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || 'admin@status.inc').trim().toLowerCase();
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'VireonAdmin2026!';
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function verifyAdminCredentials(email, password) {
  const okEmail = safeEqual(
    String(email || '').trim().toLowerCase(),
    getAdminEmail()
  );
  const okPass = safeEqual(String(password || ''), getAdminPassword());
  return okEmail && okPass;
}

export function createAdminSession(email) {
  const token = randomBytes(32).toString('hex');
  const hours = Number(process.env.ADMIN_SESSION_HOURS) || 12;
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO admin_sessions (token, email, expires_at) VALUES (?, ?, ?)`
  ).run(token, email.trim().toLowerCase(), expires);
  return { token, expiresAt: expires, email: email.trim().toLowerCase() };
}

export function destroyAdminSession(token) {
  if (!token) return;
  db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(token);
}

export function getSession(token) {
  if (!token) return null;
  const row = db
    .prepare(`SELECT * FROM admin_sessions WHERE token = ?`)
    .get(token);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroyAdminSession(token);
    return null;
  }
  return row;
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const token = bearer || req.headers['x-admin-token'] || '';
  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
  }
  req.admin = { email: session.email, token };
  next();
}
