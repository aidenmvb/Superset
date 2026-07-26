import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api';
import { useCart } from '../cartContext';
import { formatMoney } from '../format';
import ProductGallery from '../components/ProductGallery';
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
      <Section className="min-h-[50vh] bg-ink">
        <Container>
          <LoadingText>Loading product…</LoadingText>
        </Container>
      </Section>
    );
  }

  if (error || !product) {
    return (
      <Section className="min-h-[50vh] bg-ink">
        <Container>
          <Alert className="border-red-400/30 bg-red-500/10 text-red-200">
            {error || 'Product not found'}
          </Alert>
          <ButtonLink to="/catalog" variant="ghost" className="text-white">
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

  const formLabel =
    product.applicationRoute === 'topical'
      ? 'Topical'
      : product.applicationRoute === 'nasal'
        ? 'Nasal'
        : 'Injectable';

  return (
    <Section className="min-h-screen bg-ink pb-20 pt-8 text-white">
      <Container>
        <Link
          to="/catalog"
          className="mb-6 inline-block text-sm font-semibold text-indigo-300 hover:text-indigo-200 hover:underline"
        >
          ← Back to store
        </Link>
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery product={product} />

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Pill className="border-indigo-400/40 bg-indigo-500/20 text-indigo-100">{formLabel}</Pill>
              <Pill muted className="border-white/15 bg-white/5 text-white/70">
                {product.vialSize}
              </Pill>
              {product.purity && (
                <Pill muted className="border-white/15 bg-white/5 text-white/70">
                  {product.purity}
                </Pill>
              )}
            </div>
            <PageTitle className="text-white">{product.name}</PageTitle>
            {product.shortDescription && (
              <Lead className="mb-4 text-white/60">{product.shortDescription}</Lead>
            )}

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="font-display text-3xl font-semibold text-white">
                    {formatMoney(product.price)}
                  </div>
                  <div className="text-sm text-white/50">{product.vialSize}</div>
                </div>
                <span
                  className={
                    product.inStock
                      ? 'text-sm font-semibold text-emerald-300'
                      : 'text-sm font-semibold text-rose-300'
                  }
                >
                  {product.inStock ? 'In stock' : 'Out of stock'}
                </span>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/50">Qty</span>
                  <Input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={qty}
                    disabled={!product.inStock}
                    onChange={(e) => setQty(Number(e.target.value) || 1)}
                    className="w-24 border-white/15 bg-white/5 text-white"
                  />
                </label>
                <Button type="button" disabled={!product.inStock} onClick={handleAdd}>
                  {added ? 'Added to cart' : 'Add to cart'}
                </Button>
              </div>
              <p className="mt-3 text-xs text-white/40">
                Research use only. Not for human or animal consumption.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-300">
                About this compound
              </h2>
              <p className="text-sm leading-relaxed text-white/70">{product.description}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-white/10 px-4 py-3 text-sm last:border-0"
                >
                  <span className="text-white/45">{label}</span>
                  <span className="max-w-[60%] break-words text-right font-medium text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
