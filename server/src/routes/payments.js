import { Router } from 'express';
import {
  getPublishableKey,
  isLiveMode,
  requireStripe,
  stripe,
} from '../stripeClient.js';
import { priceCartItems } from '../orderService.js';

const router = Router();

router.get('/config', (_req, res) => {
  const publishableKey = getPublishableKey();
  if (!publishableKey || !stripe) {
    return res.status(503).json({
      error: 'Stripe is not configured',
      details: ['Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY'],
    });
  }
  res.json({
    publishableKey,
    liveMode: isLiveMode(),
    currency: 'usd',
  });
});

/**
 * Create a PaymentIntent priced from the live catalog.
 * Body: { items: [{ productId, quantity }], customerEmail?, customerName? }
 */
router.post('/create-intent', async (req, res) => {
  if (!requireStripe(res)) return;

  const { items, customerEmail, customerName } = req.body || {};
  const priced = priceCartItems(items);
  if (priced.error) {
    return res.status(400).json({ error: 'Validation failed', details: [priced.error] });
  }

  const { lineItems, subtotalCents, shippingCents, totalCents } = priced;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail?.trim() || undefined,
      metadata: {
        customerName: customerName?.trim() || '',
        customerEmail: customerEmail?.trim() || '',
        itemCount: String(lineItems.length),
        subtotalCents: String(subtotalCents),
        shippingCents: String(shippingCents),
        productIds: lineItems.map((l) => l.product.id).join(','),
        source: 'superset-checkout',
      },
      description: `Superset Research order (${lineItems.length} item${lineItems.length === 1 ? '' : 's'})`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amountCents: totalCents,
      amount: totalCents / 100,
      subtotalCents,
      shippingCents,
      liveMode: isLiveMode(),
    });
  } catch (err) {
    console.error('Stripe create-intent failed:', err);
    res.status(502).json({
      error: 'Failed to create payment intent',
      details: [err.message],
    });
  }
});

export default router;
