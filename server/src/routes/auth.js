import { Router } from 'express';
import db from '../db.js';
import {
  createUserSession,
  destroyUserSession,
  findUserByEmail,
  findUserById,
  hashPassword,
  mapUser,
  requireUser,
  verifyPassword,
} from '../userAuth.js';

const router = Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

router.post('/register', (req, res) => {
  const {
    email,
    password,
    name,
    phone,
    orgName,
    researchUseAck,
    ageConfirmed,
  } = req.body || {};

  const errors = [];
  if (!validateEmail(email)) errors.push('A valid email is required');
  if (!String(password || '').trim() || String(password).length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!String(name || '').trim()) errors.push('Name is required');
  if (!researchUseAck) errors.push('You must confirm research-use-only terms');
  if (!ageConfirmed) errors.push('You must confirm you are 21 or older');

  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const normalized = String(email).trim().toLowerCase();
  if (findUserByEmail(normalized)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const result = db
    .prepare(
      `
      INSERT INTO users (
        email, password_hash, name, phone, org_name, research_use_ack, age_confirmed
      ) VALUES (?, ?, ?, ?, ?, 1, 1)
    `
    )
    .run(
      normalized,
      hashPassword(password),
      String(name).trim(),
      String(phone || '').trim(),
      String(orgName || '').trim()
    );

  const user = findUserById(result.lastInsertRowid);
  const session = createUserSession(user.id);

  res.status(201).json({
    user: mapUser(user),
    token: session.token,
    expiresAt: session.expiresAt,
    message: 'Account created.',
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const session = createUserSession(user.id);
  res.json({
    user: mapUser(user),
    token: session.token,
    expiresAt: session.expiresAt,
  });
});

router.post('/logout', requireUser, (req, res) => {
  destroyUserSession(req.userToken);
  res.json({ ok: true });
});

router.get('/me', requireUser, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me', requireUser, (req, res) => {
  const { name, phone, orgName } = req.body || {};
  const current = findUserById(req.user.id);
  if (!current) return res.status(404).json({ error: 'Account not found.' });

  db.prepare(
    `
    UPDATE users SET
      name = ?,
      phone = ?,
      org_name = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `
  ).run(
    name !== undefined ? String(name).trim() : current.name,
    phone !== undefined ? String(phone).trim() : current.phone,
    orgName !== undefined ? String(orgName).trim() : current.org_name,
    current.id
  );

  res.json({ user: mapUser(findUserById(current.id)) });
});

router.post('/change-password', requireUser, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || String(newPassword).length < 8) {
    return res.status(400).json({
      error: 'Current password and a new password (8+ characters) are required.',
    });
  }

  const user = findUserById(req.user.id);
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  db.prepare(
    `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(hashPassword(newPassword), user.id);

  res.json({ ok: true, message: 'Password updated.' });
});

export default router;
