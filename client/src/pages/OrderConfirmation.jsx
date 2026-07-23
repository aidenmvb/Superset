import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../api';
import { formatMoney } from '../format';
import {
  Alert,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Lead,
  LoadingText,
  PageTitle,
  Section,
  SummaryRow,
} from '../components/ui';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (location.state?.order) return;
    let cancelled = false;
    getOrder(orderNumber)
      .then((res) => {
        if (!cancelled) setOrder(res.order);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Order not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber, location.state]);

  if (loading) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <LoadingText>Loading order from database…</LoadingText>
        </Container>
      </Section>
    );
  }

  if (error || !order) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <Alert>{error || 'Order not found'}</Alert>
          <ButtonLink to="/catalog" variant="ghost">
            Back to catalog
          </ButtonLink>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="max-w-2xl">
        <Eyebrow>ORDER CONFIRMED</Eyebrow>
        <PageTitle>Thank you — order {order.orderNumber}</PageTitle>
        <Lead className="mb-6">
          Your Stripe payment was verified and the order was saved
          {order.status ? ` with status “${order.status}”` : ''}.
        </Lead>

        <Card className="mb-6 p-6">
          <SummaryRow label="Amount paid" value={formatMoney(order.total)} strong />
          {order.paymentStatus && (
            <SummaryRow label="Payment status" value={order.paymentStatus} />
          )}
          {order.stripePaymentIntentId && (
            <SummaryRow
              label="Stripe PaymentIntent"
              value={
                <span className="max-w-[60%] break-all text-right font-mono text-xs">
                  {order.stripePaymentIntentId}
                </span>
              }
            />
          )}
          {order.items?.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-graphite-soft">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.productName} × {item.quantity} — {formatMoney(item.lineTotal)}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 font-mono text-xs text-graphite-soft">
            A receipt may be emailed by Stripe. Inventory was updated in the live database.
          </p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/catalog">Continue shopping</ButtonLink>
          <ButtonLink to="/" variant="ghost">
            Home
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
