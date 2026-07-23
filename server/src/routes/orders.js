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

const router = Router();

router.get('/', (_req, res) => {
  const orders = db
    .prepare(
      `
      SELECT id, order_number, customer_name, customer_email, status,
             payment_status, total_cents, created_at, stripe_payment_intent_id
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
      stripePaymentIntentId: o.stripe_payment_intent_id,
      totalCents: o.total_cents,
      total: o.total_cents / 100,
      createdAt: o.created_at,
    }));

  res.json({ orders, count: orders.length });
});

router.get('/:orderNumber', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE order_number = ?')
    .get(req.params.orderNumber);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({
    order: mapOrder(order, getOrderItems(order.id)),
  });
});

/**
 * Finalize order after client-side Stripe confirmation.
 * Requires a succeeded PaymentIntent matching the cart total from the DB.
 */
router.post('/', async (req, res) => {
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
  if (!customerName?.trim()) errors.push('customerName is required');
  if (!customerEmail?.trim()) errors.push('customerEmail is required');
  if (!shippingAddress?.trim()) errors.push('shippingAddress is required');
  if (!shippingCity?.trim()) errors.push('shippingCity is required');
  if (!shippingState?.trim()) errors.push('shippingState is required');
  if (!shippingZip?.trim()) errors.push('shippingZip is required');
  if (!researchUseAck) {
    errors.push('You must acknowledge research-use-only terms');
  }
  if (!paymentIntentId?.trim()) {
    errors.push('paymentIntentId is required (complete Stripe payment first)');
  }
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('At least one order item is required');
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Idempotent: already recorded for this PI
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
  } catch (err) {
    return res.status(400).json({
      error: 'Invalid payment',
      details: ['Could not retrieve PaymentIntent from Stripe'],
    });
  }

  if (paymentIntent.status !== 'succeeded') {
    return res.status(402).json({
      error: 'Payment not completed',
      details: [`PaymentIntent status is "${paymentIntent.status}"`],
    });
  }

  const priced = priceCartItems(items);
  if (priced.error) {
    return res.status(400).json({ error: 'Validation failed', details: [priced.error] });
  }

  if (paymentIntent.amount !== priced.totalCents) {
    return res.status(409).json({
      error: 'Payment amount mismatch',
      details: [
        `Stripe charged ${paymentIntent.amount} cents but cart totals ${priced.totalCents} cents`,
      ],
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
    });

    if (result.error) {
      return res.status(400).json({ error: 'Validation failed', details: [result.error] });
    }

    res.status(result.alreadyExists ? 200 : 201).json({
      order: result.order,
      message: 'Payment verified and order saved. Stock updated in the database.',
      alreadyExists: result.alreadyExists,
    });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
});

export default router;
