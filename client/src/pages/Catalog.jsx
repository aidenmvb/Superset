import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import {
  Alert,
  Chip,
  Container,
  Input,
  LoadingText,
  SectionTitle,
} from '../components/ui';

const APPLICATION_TABS = [
  { slug: '', label: 'All products' },
  { slug: 'injectable', label: 'Injectable' },
  { slug: 'topical', label: 'Topical' },
  { slug: 'nasal', label: 'Nasal' },
];

function ProductSection({ title, subtitle, products }) {
  if (!products.length) return null;
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-paper-line pb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-graphite-soft">{subtitle}</p>}
        </div>
        <span className="text-xs font-semibold text-teal-deep">
          {products.length} item{products.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const application = searchParams.get('application') || '';
  const qParam = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState(qParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getProducts({
          application: application || undefined,
          q: qParam || undefined,
        });
        if (!cancelled) setProducts(res.products);
      } catch {
        if (!cancelled) setError('Could not load the store. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [application, qParam]);

  const grouped = useMemo(() => {
    if (application) return null;
    return {
      injectable: products.filter((p) => p.applicationRoute === 'injectable'),
      topical: products.filter((p) => p.applicationRoute === 'topical'),
      nasal: products.filter((p) => p.applicationRoute === 'nasal'),
    };
  }, [products, application]);

  function setTab(slug) {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('application', slug);
    else next.delete('application');
    setSearchParams(next);
  }

  function onSearch(e) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    setSearchParams(next);
  }

  return (
    <div className="pb-16 pt-8">
      <Container wide>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
              Store
            </p>
            <SectionTitle className="text-2xl md:text-3xl">Research catalog</SectionTitle>
            <p className="mt-1 max-w-xl text-sm text-graphite-soft">
              Browse injectable, topical, and nasal research compounds.
            </p>
          </div>
          <form onSubmit={onSearch} className="flex w-full max-w-sm gap-2 sm:w-auto">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {APPLICATION_TABS.map((tab) => (
            <Chip
              key={tab.slug || 'all'}
              active={(application || '') === tab.slug}
              onClick={() => setTab(tab.slug)}
            >
              {tab.label}
            </Chip>
          ))}
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}
        {loading && <LoadingText>Loading products…</LoadingText>}

        {!loading && application && (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && !application && grouped && (
          <>
            <ProductSection
              title="Injectable"
              subtitle="Lyophilized peptides for lab reconstitution"
              products={grouped.injectable}
            />
            <ProductSection
              title="Topical"
              subtitle="Apply-on-skin research compounds"
              products={grouped.topical}
            />
            <ProductSection
              title="Nasal"
              subtitle="Nasal research delivery"
              products={grouped.nasal}
            />
          </>
        )}

        {!loading && !products.length && !error && (
          <p className="py-12 text-center text-sm text-graphite-soft">No products match your search.</p>
        )}
      </Container>
    </div>
  );
}
