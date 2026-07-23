import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import {
  Alert,
  Button,
  Chip,
  Container,
  Input,
  LoadingText,
} from '../components/ui';

const APPLICATION_TABS = [
  {
    slug: '',
    label: 'All products',
    blurb: 'Full research catalog',
  },
  {
    slug: 'injectable',
    label: 'Injectable research',
    blurb: 'Lyophilized peptides for lab reconstitution protocols',
  },
  {
    slug: 'topical',
    label: 'Topical / apply',
    blurb: 'Apply-on-skin research compounds — not for injection',
  },
  {
    slug: 'nasal',
    label: 'Nasal',
    blurb: 'Nasal research delivery compounds — not for injection',
  },
];

const WHY_US = [
  {
    title: 'Route-clear catalog',
    text: 'Every item is labeled injectable, topical, or nasal so your lab knows the intended research form at a glance.',
  },
  {
    title: 'High-purity standards',
    text: 'Typical lots target ≥98–99% purity with identity documentation available for research records.',
  },
  {
    title: 'Live inventory',
    text: 'Stock and pricing come from the real API — what you see is what is available to order.',
  },
  {
    title: 'Test & verify',
    text: 'Serial verification and partner lab testing live together on the Test & verify page.',
  },
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
  const category = searchParams.get('category') || '';
  const application = searchParams.get('application') || '';
  const qParam = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState(qParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getProducts({
      category: category || undefined,
      application: application || undefined,
      q: qParam || undefined,
    })
      .then((res) => {
        if (!cancelled) setProducts(res.products);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load products from API');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, application, qParam]);

  function applyFilters(next = {}) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  }

  function onSearch(e) {
    e.preventDefault();
    applyFilters({ q: query.trim() });
  }

  const grouped = useMemo(() => {
    const inject = products.filter((p) => p.applicationRoute === 'injectable');
    const topical = products.filter((p) => p.applicationRoute === 'topical');
    const nasal = products.filter((p) => p.applicationRoute === 'nasal');
    return { inject, topical, nasal };
  }, [products]);

  const activeTab = APPLICATION_TABS.find((t) => t.slug === application) || APPLICATION_TABS[0];

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white">
      {/* Why Choose Us */}
      <div className="border-b border-paper-line bg-gradient-to-br from-mint/80 via-white to-sky/50">
        <Container wide className="py-8 sm:py-10">
          <div className="mb-6 max-w-2xl">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
              Why choose us
            </p>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Research supply that stays organized
            </h1>
            <p className="mt-2 text-sm text-graphite-soft">
              One store for injectables, topical (apply) compounds, and nasal research peptides —
              clearly separated so your team never confuses the route.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-paper-line bg-white p-4 shadow-sm"
              >
                <div className="mb-2 h-1 w-8 rounded-full bg-animated-gradient" />
                <h3 className="mb-1 font-display text-sm font-semibold text-ink">{item.title}</h3>
                <p className="text-xs leading-relaxed text-graphite-soft sm:text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Application route tabs */}
      <div className="border-b border-paper-line bg-paper-dim/60">
        <Container wide className="py-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-graphite-soft">
            Shop by application
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {APPLICATION_TABS.map((tab) => {
              const active = application === tab.slug;
              return (
                <button
                  key={tab.slug || 'all'}
                  type="button"
                  onClick={() => applyFilters({ application: tab.slug })}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-teal bg-gradient-to-br from-teal to-cyan text-white shadow-md'
                      : 'border-paper-line bg-white text-ink hover:border-cyan/40'
                  }`}
                >
                  <div className="font-display text-sm font-semibold">{tab.label}</div>
                  <div className={`mt-0.5 text-xs ${active ? 'text-white/85' : 'text-graphite-soft'}`}>
                    {tab.blurb}
                  </div>
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Toolbar */}
      <div className="sticky top-14 z-40 border-b border-paper-line bg-white/95 backdrop-blur-md sm:top-16">
        <Container wide className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <h2 className="font-display text-lg font-semibold text-ink">{activeTab.label}</h2>
              <p className="text-xs text-graphite-soft">
                {loading ? 'Loading…' : `${products.length} compounds`} · Research use only
              </p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 sm:justify-end lg:justify-start lg:pl-6">
              <Chip active={!category} onClick={() => applyFilters({ category: '' })}>
                All research areas
              </Chip>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  active={category === cat.slug}
                  onClick={() => applyFilters({ category: cat.slug })}
                >
                  {cat.name}
                </Chip>
              ))}
            </div>
          </div>
          <form onSubmit={onSearch} className="flex w-full gap-2 lg:w-auto lg:min-w-[280px]">
            <Input
              type="search"
              placeholder="Search name or CAS…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="py-2"
            />
            <Button type="submit" size="sm" className="shrink-0">
              Search
            </Button>
          </form>
        </Container>
      </div>

      <Container wide className="py-5 pb-12">
        {error && <Alert>{error}</Alert>}
        {loading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingText>Loading products…</LoadingText>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-dashed border-paper-line text-sm text-graphite-soft">
            No products match your filters.
          </div>
        )}

        {/* When viewing "All", show separate subsections */}
        {!loading && !application && products.length > 0 && (
          <>
            <ProductSection
              title="Injectable research"
              subtitle="Lyophilized peptides for laboratory reconstitution protocols. Research use only."
              products={grouped.inject}
            />
            <ProductSection
              title="Topical / apply"
              subtitle="Apply-on-skin research compounds for dermal and matrix models — not for injection."
              products={grouped.topical}
            />
            <ProductSection
              title="Nasal"
              subtitle="Nasal research delivery compounds — not for injection. Laboratory use only."
              products={grouped.nasal}
            />
          </>
        )}

        {/* Filtered single-route grid */}
        {!loading && application && products.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
