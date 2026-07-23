import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api';
import { useCart } from '../cartContext';
import { formatMoney } from '../format';
import ProductPhoto from '../components/ProductPhoto';
import {
  Alert,
  Button,
  ButtonLink,
  Container,
  Input,
  Lead,
  LoadingText,
  PageTitle,
  Pill,
  Section,
} from '../components/ui';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProduct(slug)
      .then((res) => {
        if (!cancelled) {
          setProduct(res.product);
          setQty(1);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Product not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function handleAdd() {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <Section>
        <Container>
          <LoadingText>Loading product…</LoadingText>
        </Container>
      </Section>
    );
  }

  if (error || !product) {
    return (
      <Section>
        <Container>
          <Alert>{error || 'Product not found'}</Alert>
          <ButtonLink to="/catalog" variant="ghost">
            Back to store
          </ButtonLink>
        </Container>
      </Section>
    );
  }

  const specs = [
    ['Vial size', product.vialSize],
    ['Purity', product.purity],
    ['Form', product.form],
    ['Molecular weight', product.molecularWeight || '—'],
    ['CAS', product.casNumber || '—'],
    ['Sequence', product.sequence || '—'],
  ];

  return (
    <Section className="pb-20 pt-8">
      <Container>
        <Link
          to="/catalog"
          className="mb-6 inline-block text-sm font-semibold text-teal-deep hover:underline"
        >
          ← Back to store
        </Link>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-paper-line shadow-sm">
            <ProductPhoto product={product} size="lg" showCaption={false} />
            <div className="absolute bottom-5 left-4 right-4 z-10 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm ring-1 ring-paper-line backdrop-blur">
                {product.vialSize}
              </span>
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm ring-1 ring-paper-line backdrop-blur">
                {product.purity} purity
              </span>
              <span className="rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                As shipped to lab
              </span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Pill>{product.categoryName}</Pill>
              <Pill muted>{product.form}</Pill>
              {product.applicationLabel && (
                <Pill
                  className={
                    product.applicationRoute === 'topical'
                      ? 'bg-violet text-white'
                      : product.applicationRoute === 'nasal'
                        ? 'bg-teal-deep text-white'
                        : 'bg-ink text-white'
                  }
                >
                  {product.applicationLabel}
                </Pill>
              )}
            </div>
            <PageTitle>{product.name}</PageTitle>
            <Lead className="mb-4">{product.shortDescription}</Lead>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-paper-line bg-white p-4">
              <div>
                <div className="font-display text-3xl font-semibold text-ink">
                  {formatMoney(product.price)}
                </div>
                <div className="text-sm text-graphite-soft">{product.vialSize}</div>
              </div>
              <span
                className={
                  product.inStock
                    ? 'text-sm font-semibold text-teal-deep'
                    : 'text-sm font-semibold text-vireon-red'
                }
              >
                {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
            <div className="mb-6 rounded-2xl border border-paper-line bg-paper-dim/60 p-4">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-deep">
                About this compound
              </h2>
              <p className="text-sm leading-relaxed text-graphite">{product.description}</p>
            </div>

            <div className="mb-6 overflow-hidden rounded-2xl border border-paper-line bg-white">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-paper-line px-4 py-3 text-sm last:border-0"
                >
                  <span className="text-graphite-soft">{label}</span>
                  <span className="max-w-[60%] break-words text-right font-medium text-ink">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-graphite-soft">
                Qty
                <Input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={qty}
                  disabled={!product.inStock}
                  onChange={(e) => setQty(Number(e.target.value) || 1)}
                  className="w-24"
                />
              </label>
              <Button type="button" disabled={!product.inStock} onClick={handleAdd}>
                {added ? 'Added to cart' : 'Add to cart'}
              </Button>
            </div>
            <p className="text-xs text-graphite-soft">
              Research use only. Not for human or animal consumption.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
