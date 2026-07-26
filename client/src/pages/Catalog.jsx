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
import { cn } from '../lib/cn';

const APPLICATION_TABS = [
  { slug: '', label: 'All products', accent: 'from-indigo-500 to-violet-500' },
  { slug: 'injectable', label: 'Injectable', accent: 'from-indigo-500 to-violet-600' },
  { slug: 'topical', label: 'Topical', accent: 'from-fuchsia-500 to-rose-500' },
  { slug: 'nasal', label: 'Nasal', accent: 'from-sky-500 to-cyan-500' },
];

function ProductSection({ title, subtitle, products, accent }) {
  if (!products.length) return null;
  return (
    <section className="mb-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <div className={cn('mb-2 h-1 w-12 rounded-full bg-gradient-to-r', accent)} />
          <h2 className="font-electric text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
        </div>
        <span className="text-xs font-semibold text-white/40">
          {products.length} item{products.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
    <div className="min-h-screen bg-ink pb-20 pt-10 text-white">
      <Container wide>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 font-logo text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/80">
              Store
            </p>
            <SectionTitle className="font-electric text-2xl font-extrabold tracking-tight text-white md:text-4xl">
              Research catalog
            </SectionTitle>
            <p className="mt-2 max-w-xl text-sm text-white/55">
              Browse injectable, topical, and nasal research compounds.
            </p>
          </div>
          <form onSubmit={onSearch} className="flex w-full max-w-sm gap-2 sm:w-auto">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full border-white/15 bg-white/5 text-white placeholder:text-white/35 hover:border-white/25 focus:border-indigo-400 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink transition hover:bg-white/90"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {APPLICATION_TABS.map((tab) => {
            const active = (application || '') === tab.slug;
            return (
              <Chip
                key={tab.slug || 'all'}
                active={active}
                onClick={() => setTab(tab.slug)}
                className={
                  active
                    ? cn('border-transparent bg-gradient-to-r text-white shadow-lg', tab.accent)
                    : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                }
              >
                {tab.label}
              </Chip>
            );
          })}
        </div>

        {error && (
          <Alert className="mb-4 border-red-400/30 bg-red-500/10 text-red-200">{error}</Alert>
        )}
        {loading && <LoadingText className="text-white/50">Loading products…</LoadingText>}

        {!loading && application && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
              accent="from-indigo-500 to-violet-600"
            />
            <ProductSection
              title="Topical"
              subtitle="Apply-on-skin research compounds"
              products={grouped.topical}
              accent="from-fuchsia-500 to-rose-500"
            />
            <ProductSection
              title="Nasal"
              subtitle="Nasal research delivery"
              products={grouped.nasal}
              accent="from-sky-500 to-cyan-500"
            />
          </>
        )}

        {!loading && !products.length && !error && (
          <p className="py-12 text-center text-sm text-white/45">No products match your search.</p>
        )}
      </Container>
    </div>
  );
}
