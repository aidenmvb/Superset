import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { createOrder, createPaymentIntent, getStripeConfig } from '../api';
import { useCart } from '../cartContext';
import { formatMoney, formatMoneyFromCents } from '../format';
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  Container,
  Fieldset,
  Input,
  Label,
  Lead,
  LoadingText,
  PageTitle,
  Section,
  SummaryRow,
  Textarea,
} from '../components/ui';

const stripeAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#4f46e5',
    colorBackground: '#ffffff',
    colorText: '#0b1020',
    colorDanger: '#e11d48',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '12px',
  },
};

function CheckoutForm({ paymentIntentId, liveMode }) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [researchUseAck, setResearchUseAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (!researchUseAck) {
        throw new Error('You must acknowledge research-use-only terms');
      }

      const addressElement = elements.getElement('address');
      if (!addressElement) {
        throw new Error('Address form is not ready');
      }

      const { complete, value } = await addressElement.getValue();
      if (!complete) {
        throw new Error('Please complete the shipping address (use autocomplete suggestions)');
      }

      const shipping = value.address;
      const customerName = value.name?.trim();
      if (!customerName) {
        throw new Error('Name is required on the shipping address');
      }
      if (!customerEmail.trim()) {
        throw new Error('Email is required');
      }

      setMessage('Processing payment…');
      const { error: payError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          receipt_email: customerEmail.trim(),
          payment_method_data: {
            billing_details: {
              name: customerName,
              email: customerEmail.trim(),
              phone: customerPhone.trim() || undefined,
              address: {
                line1: shipping.line1,
                line2: shipping.line2 || undefined,
                city: shipping.city,
                state: shipping.state,
                postal_code: shipping.postal_code,
                country: shipping.country,
              },
            },
          },
          shipping: {
            name: customerName,
            phone: customerPhone.trim() || undefined,
            address: {
              line1: shipping.line1,
              line2: shipping.line2 || undefined,
              city: shipping.city,
              state: shipping.state,
              postal_code: shipping.postal_code,
              country: shipping.country,
            },
          },
        },
      });

      if (payError) {
        throw new Error(payError.message || 'Payment failed');
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        throw new Error(
          paymentIntent?.status
            ? `Payment status: ${paymentIntent.status}`
            : 'Payment was not completed'
        );
      }

      setMessage('Payment succeeded — saving order…');
      const line1 = shipping.line1 || '';
      const line2 = shipping.line2 ? `, ${shipping.line2}` : '';

      const res = await createOrder({
        customerName,
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        shippingAddress: `${line1}${line2}`.trim(),
        shippingCity: shipping.city || '',
        shippingState: shipping.state || '',
        shippingZip: shipping.postal_code || '',
        shippingCountry: shipping.country || 'US',
        notes,
        researchUseAck: true,
        paymentIntentId: paymentIntent.id || paymentIntentId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      clearCart();
      navigate(`/order/${res.order.orderNumber}`, {
        state: { order: res.order, message: res.message },
      });
    } catch (err) {
      setError(err.details?.join?.('. ') || err.message || 'Checkout failed');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div>
          <PageTitle>Checkout</PageTitle>
          <Lead>
            Secure card payment via Stripe
            {liveMode ? ' (live)' : ' (test mode)'}. Shipping uses address autocomplete.
          </Lead>
        </div>

        {error && <Alert>{error}</Alert>}
        {message && !error && <Alert variant="success">{message}</Alert>}

        <Fieldset legend="Contact">
          <div className="grid gap-3">
            <Label>
              Email *
              <Input
                type="email"
                required
                autoComplete="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </Label>
            <Label>
              Phone
              <Input
                type="tel"
                autoComplete="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </Label>
          </div>
        </Fieldset>

        <Fieldset legend="Shipping address">
          <p className="mb-2 text-sm text-slate-400">
            Start typing your street address for autocomplete suggestions.
          </p>
          <AddressElement
            options={{
              mode: 'shipping',
              autocomplete: { mode: 'automatic' },
              allowedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
              fields: { phone: 'never' },
              display: { name: 'full' },
            }}
          />
        </Fieldset>

        <Fieldset legend="Payment">
          <PaymentElement
            options={{
              layout: 'tabs',
              business: { name: 'Superset Research' },
            }}
          />
          {!liveMode && (
            <p className="mt-3 text-sm text-slate-400">
              Test card: <code>4242 4242 4242 4242</code> · any future expiry · any CVC · any ZIP
            </p>
          )}
        </Fieldset>

        <Label>
          Order notes
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Label>

        <label className="flex items-start gap-3 text-sm text-slate-400">
          <input
            type="checkbox"
            className="mt-1"
            checked={researchUseAck}
            onChange={(e) => setResearchUseAck(e.target.checked)}
            required
          />
          <span>
            I confirm these products are for laboratory research use only and are not intended for
            human or veterinary consumption. *
          </span>
        </label>

        <Button type="submit" disabled={!stripe || submitting}>
          {submitting ? 'Processing…' : 'Pay securely'}
        </Button>
      </form>
    </Card>
  );
}

export default function Checkout() {
  const { items, subtotal, subtotalCents } = useCart();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [liveMode, setLiveMode] = useState(false);
  const [priced, setPriced] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const shippingCents = subtotalCents >= 15000 ? 0 : items.length ? 999 : 0;
  const total = (subtotalCents + shippingCents) / 100;

  const cartKey = useMemo(
    () => items.map((i) => `${i.productId}:${i.quantity}`).join('|'),
    [items]
  );

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function init() {
      setLoading(true);
      setError('');
      try {
        const config = await getStripeConfig();
        if (cancelled) return;
        setLiveMode(Boolean(config.liveMode));
        setStripePromise(loadStripe(config.publishableKey));

        const intent = await createPaymentIntent({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        });
        if (cancelled) return;
        setClientSecret(intent.clientSecret);
        setPaymentIntentId(intent.paymentIntentId);
        setPriced({
          subtotalCents: intent.subtotalCents,
          shippingCents: intent.shippingCents,
          amountCents: intent.amountCents,
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              'Could not start Stripe checkout. Ensure the API has STRIPE keys configured.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [cartKey, items]);

  if (items.length === 0) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <PageTitle>Nothing to check out</PageTitle>
          <ButtonLink to="/catalog" className="mt-4">
            Browse catalog
          </ButtonLink>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        {loading && (
          <Card className="p-6">
            <LoadingText>Preparing secure Stripe checkout…</LoadingText>
          </Card>
        )}
        {!loading && error && (
          <Card className="p-6">
            <Alert>{error}</Alert>
            <ButtonLink to="/cart" variant="ghost">
              Back to cart
            </ButtonLink>
          </Card>
        )}
        {!loading && !error && clientSecret && stripePromise && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: stripeAppearance,
            }}
          >
            <CheckoutForm paymentIntentId={paymentIntentId} liveMode={liveMode} />
          </Elements>
        )}

        <Card className="sticky top-24 p-5">
          <h2 className="mb-3 text-xl font-semibold text-slate-50">Your order</h2>
          {items.map((item) => (
            <SummaryRow
              key={item.productId}
              label={`${item.name} × ${item.quantity}`}
              value={formatMoneyFromCents(item.priceCents * item.quantity)}
            />
          ))}
          <hr className="my-3 border-slate-800" />
          <SummaryRow
            label="Subtotal"
            value={formatMoney(priced ? priced.subtotalCents / 100 : subtotal)}
          />
          <SummaryRow
            label="Shipping"
            value={
              (priced ? priced.shippingCents : shippingCents) === 0
                ? 'Free'
                : formatMoneyFromCents(priced ? priced.shippingCents : shippingCents)
            }
          />
          <SummaryRow
            label="Total"
            value={formatMoney(priced ? priced.amountCents / 100 : total)}
            strong
          />
          <p className="mt-3 text-xs text-slate-500">
            Powered by Stripe · Amounts priced from the live product database
          </p>
        </Card>
      </Container>
    </Section>
  );
}
