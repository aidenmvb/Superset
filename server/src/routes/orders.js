import { Router } from 'express';
import db from '../db.js';
import { requireStripe, stripe } from '../stripeClient.js';
import {
  createPaidOrder,
  findOrderByPaymentIntent,
  getOrderItems,
  mapOrder,
  priceCartItems,
} from '../orderService.js';
import { optionalUser } from '../userAuth.js';
import { requireAdmin } from '../adminAuth.js';

const router = Router();

function canAccessOrder(order, req) {
  if (!order) return false;
  // Owner via account
  if (req.user?.id && order.user_id && Number(order.user_id) === Number(req.user.id)) {
    return true;
  }
  // Logged-in email match (guest checkout later claimed by same email account)
  if (req.user?.email) {
    const a = String(req.user.email).trim().toLowerCase();
    const b = String(order.customer_email || '').trim().toLowerCase();
    if (a && a === b) return true;
  }
  // Guest confirmation: must supply matching email
  const emailQ = String(req.query.email || req.headers['x-order-email'] || '')
    .trim()
    .toLowerCase();
  if (emailQ && emailQ === String(order.customer_email || '').trim().toLowerCase()) {
    return true;
  }
  return false;
}

/** Admin-only full list — never public */
router.get('/', requireAdmin, (_req, res) => {
  const orders = db
    .prepare(
      `
      SELECT id, order_number, customer_name, customer_email, status,
             payment_status, total_cents, created_at, user_id
      FROM orders
      ORDER BY created_at DESC
      LIMIT 100
    `
    )
    .all()
    .map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      status: o.status,
      paymentStatus: o.payment_status,
      totalCents: o.total_cents,
      total: o.total_cents / 100,
      userId: o.user_id,
      createdAt: o.created_at,
    }));

  res.json({ orders, count: orders.length });
});

/**
 * Order detail — owner, matching logged-in email, or guest with ?email=
 */
router.get('/:orderNumber', optionalUser, (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE order_number = ?')
    .get(req.params.orderNumber);

  if (!order || !canAccessOrder(order, req)) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  res.json({
    order: mapOrder(order, getOrderItems(order.id)),
  });
});

/**
 * Finalize order after client-side Stripe confirmation.
 */
router.post('/', optionalUser, async (req, res) => {
  if (!requireStripe(res)) return;

  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingZip,
    shippingCountry = 'US',
    notes,
    researchUseAck,
    items,
    paymentIntentId,
  } = req.body || {};

  const errors = [];
  if (!customerName?.trim()) errors.push('Name is required');
  if (!customerEmail?.trim()) errors.push('Email is required');
  if (!shippingAddress?.trim()) errors.push('Shipping address is required');
  if (!shippingCity?.trim()) errors.push('City is required');
  if (!shippingState?.trim()) errors.push('State is required');
  if (!shippingZip?.trim()) errors.push('ZIP is required');
  if (!researchUseAck) {
    errors.push('You must acknowledge research-use-only terms');
  }
  if (!paymentIntentId?.trim()) {
    errors.push('Payment must be completed first');
  }
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one order item is required');
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const existing = findOrderByPaymentIntent(paymentIntentId.trim());
  if (existing) {
    return res.status(200).json({
      order: mapOrder(existing, getOrderItems(existing.id)),
      message: 'Order already recorded for this payment.',
      alreadyExists: true,
    });
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId.trim());
  } catch {
    return res.status(400).json({
      error: 'Invalid payment',
      details: ['Could not verify payment'],
    });
  }

  if (paymentIntent.status !== 'succeeded') {
    return res.status(402).json({
      error: 'Payment not completed',
      details: ['Please complete payment and try again'],
    });
  }

  const priced = priceCartItems(items);
  if (priced.error) {
    return res.status(400).json({ error: 'Validation failed', details: [priced.error] });
  }

  if (paymentIntent.amount !== priced.totalCents) {
    return res.status(409).json({
      error: 'Payment amount mismatch',
      details: ['Cart total changed. Refresh checkout and try again.'],
    });
  }

  try {
    const result = createPaidOrder({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      notes,
      researchUseAck,
      items,
      paymentIntentId: paymentIntent.id,
      userId: req.user?.id || null,
    });

    if (result.error) {
      return res.status(400).json({ error: 'Validation failed', details: [result.error] });
    }

    res.status(result.alreadyExists ? 200 : 201).json({
      order: result.order,
      message: 'Payment confirmed. Your order is complete.',
      alreadyExists: result.alreadyExists,
    });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Failed to create order. Please contact support.' });
  }
});

export default router;
