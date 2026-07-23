import { Link } from 'react-router-dom';
import { useCart } from '../cartContext';
import { formatMoney, formatMoneyFromCents } from '../format';
import {
  Button,
  ButtonLink,
  Card,
  Container,
  Input,
  Lead,
  PageTitle,
  Section,
  SummaryRow,
} from '../components/ui';

export default function Cart() {
  const { items, subtotal, subtotalCents, setQuantity, removeItem } = useCart();
  const shippingCents = subtotalCents >= 15000 ? 0 : items.length ? 999 : 0;
  const total = (subtotalCents + shippingCents) / 100;

  if (items.length === 0) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <PageTitle>Your cart is empty</PageTitle>
          <Lead className="mb-6">Browse the live catalog and add research compounds.</Lead>
          <ButtonLink to="/catalog">Browse catalog</ButtonLink>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <PageTitle>Cart</PageTitle>
          <div className="mt-4 divide-y divide-paper-line border-y border-paper-line">
            {items.map((item) => (
              <div
                key={item.productId}
                className="grid grid-cols-1 items-center gap-4 py-4 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <div>
                  <Link
                    to={`/product/${item.slug}`}
                    className="font-display font-semibold text-ink hover:text-teal-deep"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-1 font-mono text-[11px] text-graphite-soft">
                    {item.vialSize} · {formatMoneyFromCents(item.priceCents)} each
                  </div>
                </div>
                <label className="flex flex-col gap-1 font-mono text-[11px] text-graphite-soft">
                  Qty
                  <Input
                    type="number"
                    min={1}
                    max={item.stock || 99}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productId, Number(e.target.value) || 1)}
                    className="w-20 py-2"
                  />
                </label>
                <strong className="font-mono text-sm">
                  {formatMoneyFromCents(item.priceCents * item.quantity)}
                </strong>
                <button
                  type="button"
                  className="font-mono text-[11px] text-vireon-red underline"
                  onClick={() => removeItem(item.productId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <Card className="sticky top-28 p-6">
          <h2 className="mb-4 font-display text-base tracking-wide">ORDER SUMMARY</h2>
          <SummaryRow label="Subtotal" value={formatMoney(subtotal)} />
          <SummaryRow
            label="Shipping"
            value={shippingCents === 0 ? 'Free' : formatMoneyFromCents(shippingCents)}
          />
          <p className="my-2 font-mono text-[11px] text-graphite-soft">Free shipping on orders $150+</p>
          <SummaryRow label="Total" value={formatMoney(total)} strong />
          <ButtonLink to="/checkout" full className="mt-4">
            Proceed to checkout
          </ButtonLink>
        </Card>
      </Container>
    </Section>
  );
}
