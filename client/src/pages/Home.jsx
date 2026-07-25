import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';
import FaqSection from '../components/FaqSection';
import HeroFormStage from '../components/HeroFormStage';
import ProductCard from '../components/ProductCard';
import TestimonialsSection from '../components/TestimonialsSection';
import {
  Alert,
  ButtonLink,
  Container,
  LoadingText,
  Section,
  SectionTitle,
} from '../components/ui';

function RouteBlock({ id, title, subtitle, href, products, accent }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className={`mb-0.5 text-xs font-bold uppercase tracking-[0.16em] ${accent}`}>{title}</p>
          <SectionTitle className="text-lg md:text-xl">{subtitle}</SectionTitle>
        </div>
        <Link to={href} className="text-sm font-semibold text-teal-deep hover:text-cyan">
          Shop all →
        </Link>
      </div>
      {products?.length ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Hero variant: one still-life photograph (vial · nasal · topical).
 * Hover a package → zoom + name. Click → that form section.
 */
export default function Home() {
  const [injectable, setInjectable] = useState([]);
  const [topical, setTopical] = useState([]);
  const [nasal, setNasal] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [inj, top, nas] = await Promise.all([
          getProducts({ application: 'injectable' }),
          getProducts({ application: 'topical' }),
          getProducts({ application: 'nasal' }),
        ]);
        if (!cancelled) {
          setInjectable(inj.products);
          setTopical(top.products);
          setNasal(nas.products);
        }
      } catch {
        if (!cancelled) {
          setError('Store temporarily unavailable. Please try again in a moment.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section
        className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white"
        aria-label="Vantril Research"
      >
        <HeroFormStage />

        <Container
          wide
          className="pointer-events-none relative z-[1] flex min-h-[100svh] flex-col pb-16 pt-24 sm:pt-28"
        >
          {/* Electric intro panel — bold Syne headline, glass shell */}
          <div className="pointer-events-auto max-w-[19rem] sm:max-w-[22rem] lg:max-w-[24rem]">
            <div className="rounded-3xl border border-white/10 bg-ink/45 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-rose-400" aria-hidden />
                <span className="font-logo text-[10px] font-bold uppercase tracking-[0.24em] text-white/80">
                  Research compounds
                </span>
              </div>

              <h1 className="font-electric text-[2.2rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-[2.65rem] lg:text-[3rem]">
                Peptides you can
                <br />
                <span className="bg-gradient-to-r from-indigo-200 via-white to-rose-200 bg-clip-text text-transparent">
                  put a name to.
                </span>
              </h1>

              <p className="mt-4 max-w-[18rem] text-sm font-medium leading-relaxed text-white/70">
                Select a package — injectable, nasal, or topical research forms.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ButtonLink
                  to="/catalog"
                  className="rounded-full border-0 bg-white px-5 py-2.5 text-xs font-bold tracking-wide text-ink shadow-lg shadow-black/30 hover:bg-white/95 sm:text-sm"
                >
                  Enter the store
                </ButtonLink>
                <Link
                  to="/verify"
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold tracking-wide text-white/90 backdrop-blur-sm transition hover:border-white/35 hover:bg-white/10 hover:text-white sm:text-sm"
                >
                  Test & verify lots
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="catalog-preview" className="border-b border-paper-line bg-white py-10 sm:py-12">
        <Container wide>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.16em] text-violet">
                Shop by form
              </p>
              <SectionTitle className="text-lg md:text-xl">
                Injectable · Nasal · Topical
              </SectionTitle>
              <p className="mt-1 max-w-xl text-sm text-graphite-soft">
                Every listing is labeled by research form so your lab knows what you are ordering.
              </p>
            </div>
            <Link
              to="/catalog"
              className="text-sm font-semibold text-teal-deep transition hover:text-cyan"
            >
              Open full store →
            </Link>
          </div>
          {error && <Alert>{error}</Alert>}
          {loading && <LoadingText>Loading products…</LoadingText>}
          <RouteBlock
            id="form-injectable"
            title="Injectable"
            subtitle="Lyophilized research peptides"
            href="/catalog?application=injectable"
            products={injectable}
            accent="text-ink"
          />
          <RouteBlock
            id="form-nasal"
            title="Nasal"
            subtitle="Nasal research delivery"
            href="/catalog?application=nasal"
            products={nasal}
            accent="text-violet"
          />
          <RouteBlock
            id="form-topical"
            title="Topical"
            subtitle="Apply-on-skin research compounds"
            href="/catalog?application=topical"
            products={topical}
            accent="text-teal-deep"
          />
        </Container>
      </section>

      <Section className="py-14">
        <Container>
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
              Why Vantril
            </p>
            <SectionTitle>Built for research buyers</SectionTitle>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                t: 'Documented purity',
                d: 'Typical lots target ≥98–99% purity with identity confirmation available for your records.',
                c: 'from-teal to-cyan',
              },
              {
                t: 'Clear packaging forms',
                d: 'Vials, serums, and nasal sprays match how each compound is used in the lab.',
                c: 'from-cyan to-violet',
              },
              {
                t: 'Straightforward ordering',
                d: 'Browse, checkout securely, and track orders from your researcher account.',
                c: 'from-violet to-teal',
              },
            ].map((item) => (
              <div
                key={item.t}
                className="group overflow-hidden rounded-2xl border border-paper-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r ${item.c}`} />
                <h3 className="mb-2 font-display text-base font-semibold text-ink">{item.t}</h3>
                <p className="text-sm leading-relaxed text-graphite-soft">{item.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
