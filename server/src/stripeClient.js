import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn(
    'STRIPE_SECRET_KEY is not set. Payment endpoints will return 503 until configured.'
  );
}

export const stripe = secretKey ? new Stripe(secretKey) : null;

export function requireStripe(res) {
  if (!stripe) {
    res.status(503).json({
      error: 'Stripe is not configured',
      details: ['Set STRIPE_SECRET_KEY (from Stripe CLI or Dashboard)'],
    });
    return false;
  }
  return true;
}

export function getPublishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}

export function isLiveMode() {
  return Boolean(secretKey && secretKey.startsWith('sk_live_'));
}
