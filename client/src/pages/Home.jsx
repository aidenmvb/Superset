import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getProducts } from '../api';
import FaqSection from '../components/FaqSection';
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

const HERO_IMAGE = '/images/peptides-hero.jpg';
const HERO_VIDEO = '/videos/lab-peptide-hero.mp4';

function RouteBlock({ title, subtitle, href, products, accent }) {
  if (!products?.length) return null;
  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className={`mb-0.5 text-xs font-bold uppercase tracking-[0.16em] ${accent}`}>{title}</p>
          <SectionTitle className="text-lg md:text-xl">{subtitle}</SectionTitle>
        </div>
        <Link to={href} className="text-sm font-semibold text-teal-deep hover:text-cyan">
          Shop all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [injectable, setInjectable] = useState([]);
  const [topical, setTopical] = useState([]);
  const [nasal, setNasal] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [inj, top, nas, categoriesRes] = await Promise.all([
          getProducts({ application: 'injectable' }),
          getProducts({ application: 'topical' }),
          getProducts({ application: 'nasal' }),
          getCategories(),
        ]);
        if (!cancelled) {
          setInjectable(inj.products);
          setTopical(top.products);
          setNasal(nas.products);
          setCategories(categoriesRes.categories);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              'Could not reach the API. Start the backend with: cd server && npm run dev'
          );
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
      {/* Bold hero with peptide photography */}
      <section className="relative overflow-hidden border-b border-paper-line">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover opacity-25"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-teal-deep/90 to-[#f43f5e]/75" />
          <div className="animate-pulse-glow absolute -left-20 top-10 h-72 w-72 rounded-full bg-violet/35 blur-3xl" />
          <div className="animate-pulse-glow absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-cyan/30 blur-3xl" />
        </div>

        <Container wide className="relative grid items-center gap-8 py-10 md:grid-cols-2 md:gap-10 md:py-14">
          <div className="animate-fade-up text-white">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
              Research peptides
            </p>
            <h1 className="mb-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.4rem]">
              Precision peptides
              <br />
              <span className="bg-gradient-to-r from-indigo-200 via-white to-rose-200 bg-clip-text text-transparent">
                for serious labs.
              </span>
            </h1>
            <p className="mb-7 max-w-md text-base leading-relaxed text-slate-200">
              High-purity lyophilized compounds with clear specs and a clean store experience —
              built for qualified researchers.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink
                to="/catalog"
                className="border-0 bg-white text-ink shadow-lg shadow-black/20 hover:bg-mint"
              >
                Shop store
              </ButtonLink>
              <ButtonLink
                to="/verify"
                variant="ghost"
                className="border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20"
              >
                Test & verify
              </ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-indigo-100/90">
              {['99%+ purity target', 'Third-party tested', 'Research use only'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="text-amber">✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Peptide photo — palette-matched, soft-edges into hero */}
          <div className="animate-fade-up-delay relative isolate">
            {/* Ambient glow matching hero indigo → coral */}
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-teal/40 via-violet/30 to-cyan/45 opacity-70 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <img
                src={HERO_IMAGE}
                alt="Research peptide vials on a laboratory surface"
                className="h-auto w-full scale-[1.04] object-cover"
                width={960}
                height={540}
              />
              {/* Color grade wash — indigo/violet/coral site palette */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-deep/35 via-violet/15 to-cyan/35 mix-blend-color" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal/20 via-transparent to-cyan/25 mix-blend-soft-light" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-teal-deep/25" />
              {/* Heavy edge feather so photo melts into surrounding hero */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow:
                    'inset 0 0 60px 28px rgba(11,16,32,0.72), inset 0 0 120px 48px rgba(55,48,163,0.45)',
                }}
              />
              {/* Side fades into hero gradient */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-ink/50 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-ink/40 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/60 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-teal-deep/40 to-transparent" />
              <div className="pointer-events-none absolute -inset-px rounded-[1.75rem] ring-1 ring-white/10" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  Lyophilized vials
                </span>
                <span className="rounded-full bg-gradient-to-r from-teal to-violet px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  Lab-grade packaging
                </span>
              </div>
            </div>

            <div className="animate-float-slow pointer-events-none absolute -left-3 top-8 hidden h-20 w-10 rounded-full border border-white/25 bg-gradient-to-b from-white/50 to-violet/40 shadow-lg md:block" />
            <div className="animate-float-delayed pointer-events-none absolute -right-2 bottom-16 hidden h-24 w-12 rounded-full border border-white/25 bg-gradient-to-b from-white/50 to-cyan/40 shadow-lg md:block" />
          </div>
        </Container>
      </section>

      {/* Stats strip */}
      <div className="border-b border-paper-line bg-white">
        <Container className="grid grid-cols-2 divide-x divide-paper-line md:grid-cols-4">
          {[
            ['99%+', 'Purity target'],
            ['HPLC / MS', 'Identity testing'],
            ['Live API', 'Real inventory'],
            ['Serials', 'Batch verify'],
          ].map(([value, label], i) => (
            <div
              key={label}
              className={`animate-fade-up px-4 py-5 text-center`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="font-display text-xl font-semibold text-teal-deep md:text-2xl">
                {value}
              </div>
              <div className="mt-0.5 text-xs font-medium text-graphite-soft md:text-sm">{label}</div>
            </div>
          ))}
        </Container>
      </div>

      {/* Category strip — full width, tight */}
      <Section className="bg-white py-6">
        <Container wide>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
                Browse
              </p>
              <SectionTitle className="text-lg md:text-xl">Shop by category</SectionTitle>
            </div>
            <Link
              to="/catalog"
              className="text-sm font-semibold text-teal-deep transition hover:text-cyan"
            >
              Full store →
            </Link>
          </div>
          {error && <Alert>{error}</Alert>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="group rounded-xl border border-paper-line bg-paper-dim/50 px-4 py-4 transition hover:border-cyan/40 hover:bg-white hover:shadow-md"
              >
                <div className="mb-2 h-1 w-8 rounded-full bg-animated-gradient" />
                <div className="font-display text-sm font-semibold text-ink group-hover:text-teal-deep">
                  {cat.name}
                </div>
                <div className="mt-1 text-xs font-semibold text-teal">
                  {cat.productCount} products
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Store subsections by application route */}
      <section className="border-y border-paper-line bg-white py-6 sm:py-8">
        <Container wide>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.16em] text-violet">
                In the store
              </p>
              <SectionTitle className="text-lg md:text-xl">
                Injectable · Topical · Nasal
              </SectionTitle>
              <p className="mt-1 max-w-xl text-sm text-graphite-soft">
                Same store tab — clearly separated by how the research compound is used in the lab.
              </p>
            </div>
            <Link
              to="/catalog"
              className="text-sm font-semibold text-teal-deep transition hover:text-cyan"
            >
              Open full store →
            </Link>
          </div>
          {loading && <LoadingText>Loading products…</LoadingText>}
          <RouteBlock
            title="Injectable"
            subtitle="Lyophilized research peptides"
            href="/catalog?application=injectable"
            products={injectable}
            accent="text-ink"
          />
          <RouteBlock
            title="Topical / apply"
            subtitle="Apply-on-skin research compounds — not for injection"
            href="/catalog?application=topical"
            products={topical}
            accent="text-teal-deep"
          />
          <RouteBlock
            title="Nasal"
            subtitle="Nasal research delivery — not for injection"
            href="/catalog?application=nasal"
            products={nasal}
            accent="text-violet"
          />
        </Container>
      </section>

      {/* Trust / process */}
      <Section className="py-16">
        <Container>
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-deep">
              Why Vireon
            </p>
            <SectionTitle>Sharp, organized, research-first</SectionTitle>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                t: 'Documented purity',
                d: 'Typical lots target ≥98–99% purity with identity confirmation via MS.',
                c: 'from-teal to-cyan',
              },
              {
                t: 'Batch serials',
                d: 'Register and verify serials through admin and the public batch checker.',
                c: 'from-cyan to-violet',
              },
              {
                t: 'Live inventory',
                d: 'Catalog and stock come from the real API — checkout updates inventory.',
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
