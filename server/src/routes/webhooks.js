import { Router } from 'express';
import { requireStripe, stripe } from '../stripeClient.js';

const router = Router();

/**
 * Stripe webhook endpoint. Use Stripe CLI locally:
 *   stripe listen --forward-to localhost:3001/api/webhooks/stripe
 *
 * Body must be raw Buffer (configured in index.js before express.json).
 */
router.post('/stripe', async (req, res) => {
  if (!requireStripe(res)) return;

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Fallback for local debugging without secret — not for production
      event = typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString())
        : req.body;
      console.warn('Webhook processed without signature verification (set STRIPE_WEBHOOK_SECRET)');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      console.log(`PaymentIntent succeeded: ${pi.id} amount=${pi.amount}`);
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.warn(`PaymentIntent failed: ${pi.id}`);
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});

export default router;
