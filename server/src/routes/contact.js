import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  const errors = [];

  if (!name?.trim()) errors.push('name is required');
  if (!email?.trim()) errors.push('email is required');
  if (!message?.trim()) errors.push('message is required');

  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const result = db
    .prepare(
      `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `
    )
    .run(
      name.trim(),
      email.trim().toLowerCase(),
      subject?.trim() || '',
      message.trim()
    );

  res.status(201).json({
    message: 'Message received. We will respond shortly.',
    id: Number(result.lastInsertRowid),
  });
});

router.get('/', (_req, res) => {
  const messages = db
    .prepare(
      `
      SELECT id, name, email, subject, message, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 50
    `
    )
    .all()
    .map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      createdAt: m.created_at,
    }));

  res.json({ messages, count: messages.length });
});

export default router;
