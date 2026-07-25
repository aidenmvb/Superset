import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../api';
import { useAuth } from '../authContext';
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
  const { token, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (location.state?.order) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let email = location.state?.email || '';
    try {
      email = email || sessionStorage.getItem(`order-email:${orderNumber}`) || '';
    } catch {
      /* ignore */
    }

    getOrder(orderNumber, { email, token })
      .then((res) => {
        if (!cancelled) setOrder(res.order);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.message ||
              'Order not found. If you just checked out as a guest, open the link from your confirmation email or sign in.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber, location.state, token]);

  if (loading) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <LoadingText>Loading your order…</LoadingText>
        </Container>
      </Section>
    );
  }

  if (error || !order) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <Alert>{error || 'Order not found'}</Alert>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink to="/catalog" variant="ghost">
              Back to store
            </ButtonLink>
            {!isAuthenticated && (
              <ButtonLink to="/account/login" variant="ghost">
                Sign in
              </ButtonLink>
            )}
          </div>
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
          Your payment was successful. A receipt was sent if email delivery is configured for your
          card network. Save your order number for support.
        </Lead>

        <Card className="mb-6 p-6">
          <SummaryRow label="Amount paid" value={formatMoney(order.total)} strong />
          {order.paymentStatus && (
            <SummaryRow label="Payment status" value={order.paymentStatus} />
          )}
          <SummaryRow label="Status" value={order.status} />
          <SummaryRow
            label="Ship to"
            value={`${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`}
          />
        </Card>

        <Card className="mb-6 p-6">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Items</h2>
          {(order.items || []).map((item) => (
            <SummaryRow
              key={item.id || item.productName}
              label={`${item.quantity}× ${item.productName} (${item.vialSize})`}
              value={formatMoney(item.lineTotal)}
            />
          ))}
        </Card>

        <div className="flex flex-wrap gap-3">
          {isAuthenticated ? (
            <ButtonLink to="/account">View in your account</ButtonLink>
          ) : (
            <ButtonLink
              to="/account/register"
              state={{ email: order.customerEmail }}
            >
              Create account to track orders
            </ButtonLink>
          )}
          <ButtonLink to="/catalog" variant="ghost">
            Continue shopping
          </ButtonLink>
        </div>

        {!isAuthenticated && (
          <p className="mt-4 text-sm text-graphite-soft">
            Already have an account?{' '}
            <Link to="/account/login" className="font-semibold text-teal-deep hover:underline">
              Sign in
            </Link>{' '}
            with the same email to see matching orders.
          </p>
        )}
      </Container>
    </Section>
  );
}
