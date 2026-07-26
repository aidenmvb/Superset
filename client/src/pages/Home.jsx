import { Link } from 'react-router-dom';
import HeroFormStage from '../components/HeroFormStage';
import { ButtonLink, Container } from '../components/ui';
import { cn } from '../lib/cn';

/** Simple line icons — no external icon pack */
function IconVial({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M12 4h8M13 4v5.2L8.5 16.5A7 7 0 0 0 14.6 28h2.8a7 7 0 0 0 6.1-11.5L19 9.2V4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconSpray({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M14 14h4a5 5 0 0 1 5 5v7a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16 14V9m0 0h3.5a2 2 0 0 1 1.5.7L23 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 6v2M19 5l1 2M13 5l-1 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconDropper({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M16 4c-1.2 0-2.5 1-2.5 2.8V10l-4.2 7.5A5.5 5.5 0 0 0 14 27h4a5.5 5.5 0 0 0 4.7-9.5L18.5 10V6.8C18.5 5 17.2 4 16 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconShield({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M16 4 7 8v7c0 6.2 3.9 10.4 9 12 5.1-1.6 9-5.8 9-12V8l-9-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m12 16 2.5 2.5L20 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconScan({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M6 11V8a2 2 0 0 1 2-2h3M23 6h3a2 2 0 0 1 2 2v3M28 21v3a2 2 0 0 1-2 2h-3M11 26H8a2 2 0 0 1-2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconCart({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M5 7h2.2l2 14h13.5l2.3-10H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="25" r="1.6" fill="currentColor" />
      <circle cx="22" cy="25" r="1.6" fill="currentColor" />
    </svg>
  );
}

function IconUser({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="16" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 26c1.5-4.5 5-7 9-7s7.5 2.5 9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconFlask({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d="M12 4h8M14 4v8L8 24a4 4 0 0 0 3.5 6h9A4 4 0 0 0 24 24L18 12V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const FORMS = [
  {
    id: 'injectable',
    label: 'Injectable',
    title: 'Lyophilized vials',
    body: 'Powders for lab reconstitution. Clear mass labels — open the full injectable catalog.',
    to: '/catalog?application=injectable',
    Icon: IconVial,
    accent: 'from-indigo-500 to-violet-600',
    glow: 'shadow-indigo-500/25',
    ring: 'group-hover:border-indigo-400/50',
    chip: 'bg-indigo-500/20 text-indigo-200',
    iconBg: 'bg-indigo-500/15 text-indigo-300',
  },
  {
    id: 'nasal',
    label: 'Nasal',
    title: 'Research spray',
    body: 'Nasal research delivery in spray format. Specs on the listing — shop all nasal compounds.',
    to: '/catalog?application=nasal',
    Icon: IconSpray,
    accent: 'from-sky-500 to-cyan-500',
    glow: 'shadow-sky-500/25',
    ring: 'group-hover:border-sky-400/50',
    chip: 'bg-sky-500/20 text-sky-200',
    iconBg: 'bg-sky-500/15 text-sky-300',
  },
  {
    id: 'topical',
    label: 'Topical',
    title: 'Serum · apply',
    body: 'Apply-on-skin research models. Serum packaging that matches the protocol — browse topical.',
    to: '/catalog?application=topical',
    Icon: IconDropper,
    accent: 'from-fuchsia-500 to-rose-500',
    glow: 'shadow-fuchsia-500/25',
    ring: 'group-hover:border-fuchsia-400/50',
    chip: 'bg-fuchsia-500/20 text-fuchsia-200',
    iconBg: 'bg-fuchsia-500/15 text-fuchsia-300',
  },
];

const ACTIONS = [
  {
    to: '/catalog',
    label: 'Full store',
    desc: 'All compounds, all forms',
    Icon: IconCart,
    color: 'text-emerald-300',
    bg: 'from-emerald-500/20 to-teal-600/10',
    border: 'border-emerald-500/30 hover:border-emerald-400/50',
  },
  {
    to: '/verify',
    label: 'Verify a lot',
    desc: 'Check a serial number',
    Icon: IconScan,
    color: 'text-amber-300',
    bg: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-500/30 hover:border-amber-400/50',
  },
  {
    to: '/verify#testing',
    label: 'Find a lab',
    desc: 'Third-party testing',
    Icon: IconFlask,
    color: 'text-cyan-300',
    bg: 'from-cyan-500/20 to-blue-600/10',
    border: 'border-cyan-500/30 hover:border-cyan-400/50',
  },
  {
    to: '/account',
    label: 'Account',
    desc: 'Orders & addresses',
    Icon: IconUser,
    color: 'text-violet-300',
    bg: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/30 hover:border-violet-400/50',
  },
];

/**
 * Homepage: dark canvas with bold color blocks, icons, and useful actions.
 * Product grids live on /catalog only.
 */
export default function Home() {
  return (
    <div className="bg-ink text-white">
      {/* ── Hero ── */}
      <section
        className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink"
        aria-label="Vantril Research"
      >
        <HeroFormStage />

        <Container
          wide
          className="pointer-events-none relative z-[1] flex min-h-[100svh] flex-col justify-between pb-10 pt-24 sm:pb-12 sm:pt-28"
        >
          {/* Top-left brand panel */}
          <div className="pointer-events-auto max-w-[19rem] sm:max-w-[22rem] lg:max-w-[24rem]">
            <div className="rounded-3xl border border-white/10 bg-ink/45 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-rose-400"
                  aria-hidden
                />
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
                Hover a package to focus it. Click for a form guide — then shop that catalog.
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

          {/* Bottom-right companion panel — near the three product bottles */}
          <div className="pointer-events-auto mt-8 flex w-full justify-end sm:mt-0">
            <div className="w-full max-w-[17.5rem] rounded-3xl border border-white/10 bg-ink/50 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:max-w-[19rem] sm:p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
                <span className="font-logo text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                  Quick access
                </span>
              </div>
              <p className="font-electric text-base font-bold leading-snug tracking-tight text-white sm:text-lg">
                Three forms. One store.
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60 sm:text-[13px]">
                Jump straight to injectable, nasal, or topical — or open everything.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                <Link
                  to="/catalog?application=injectable"
                  className="rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-1.5 py-2 text-center font-logo text-[10px] font-bold uppercase tracking-wide text-indigo-100 transition hover:bg-indigo-500/25"
                >
                  Inject
                </Link>
                <Link
                  to="/catalog?application=nasal"
                  className="rounded-xl border border-sky-400/30 bg-sky-500/15 px-1.5 py-2 text-center font-logo text-[10px] font-bold uppercase tracking-wide text-sky-100 transition hover:bg-sky-500/25"
                >
                  Nasal
                </Link>
                <Link
                  to="/catalog?application=topical"
                  className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/15 px-1.5 py-2 text-center font-logo text-[10px] font-bold uppercase tracking-wide text-fuchsia-100 transition hover:bg-fuchsia-500/25"
                >
                  Topical
                </Link>
              </div>
              <Link
                to="/catalog"
                className="mt-3 flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-md transition hover:bg-white/95"
              >
                Browse full store →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Shop by form — bold color cards ── */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0c1024] px-3 py-20 sm:px-5 sm:py-28 lg:px-6">
        <div
          className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-rose-600/15 blur-3xl"
          aria-hidden
        />
        <Container className="relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-logo text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-300/80">
                Jump into the store
              </p>
              <h2 className="mt-3 font-electric text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                Shop by form.
              </h2>
            </div>
            <Link
              to="/catalog"
              className="font-logo text-xs font-bold uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
            >
              View all products →
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {FORMS.map((form) => (
              <Link
                key={form.id}
                to={form.to}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-ink/80 p-6 shadow-xl transition duration-300 sm:p-7',
                  form.glow,
                  form.ring,
                  'hover:-translate-y-1 hover:shadow-2xl'
                )}
              >
                <div
                  className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', form.accent)}
                  aria-hidden
                />
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl',
                    form.iconBg
                  )}
                >
                  <form.Icon className="h-8 w-8" />
                </div>
                <span
                  className={cn(
                    'mt-5 inline-flex w-fit rounded-full px-2.5 py-0.5 font-logo text-[10px] font-bold uppercase tracking-[0.18em]',
                    form.chip
                  )}
                >
                  {form.label}
                </span>
                <h3 className="mt-3 font-electric text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {form.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{form.body}</p>
                <span className="mt-7 inline-flex items-center gap-2 font-logo text-xs font-bold uppercase tracking-[0.16em] text-white">
                  Open catalog
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Quick actions — useful tools ── */}
      <section className="relative border-t border-white/[0.06] bg-gradient-to-b from-[#12163a] to-ink px-3 py-20 sm:px-5 sm:py-24 lg:px-6">
        <Container>
          <div className="max-w-xl">
            <p className="font-logo text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300/80">
              Tools
            </p>
            <h2 className="mt-3 font-electric text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
              Do something useful.
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Skip the walls of copy — jump straight to ordering, verification, or your account.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={cn(
                  'group flex items-start gap-4 rounded-2xl border bg-gradient-to-br p-5 transition duration-300',
                  action.border,
                  action.bg,
                  'hover:-translate-y-0.5'
                )}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/25',
                    action.color
                  )}
                >
                  <action.Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-electric text-base font-bold text-white">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-white/55">{action.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Purity band — high contrast ── */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-gradient-to-br from-indigo-950 via-violet-950 to-ink px-3 py-20 sm:px-5 sm:py-24 lg:px-6">
        <div
          className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden
        />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
                <IconShield className="h-7 w-7" />
              </div>
              <h2 className="font-electric text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
                Documented purity.
                <br />
                <span className="text-violet-300">Research use only.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
                Typical lots target ≥98–99% purity. Listings are for laboratory and in vitro research —
                not for human or veterinary use.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { t: '≥98–99%', s: 'Typical purity target', c: 'border-violet-400/40 bg-violet-500/15' },
                { t: 'Serials', s: 'Lot check on verify', c: 'border-indigo-400/40 bg-indigo-500/15' },
                { t: '3 forms', s: 'Injectable · Nasal · Topical', c: 'border-fuchsia-400/40 bg-fuchsia-500/15' },
                { t: '21+', s: 'Age-gated research buyers', c: 'border-rose-400/40 bg-rose-500/15' },
              ].map((stat) => (
                <div
                  key={stat.t}
                  className={cn('rounded-2xl border px-5 py-5', stat.c)}
                >
                  <p className="font-electric text-2xl font-extrabold text-white sm:text-3xl">{stat.t}</p>
                  <p className="mt-1 text-sm text-white/60">{stat.s}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Verify strip ── */}
      <section className="relative border-t border-white/[0.06] bg-gradient-to-r from-amber-950/80 via-ink to-ink px-3 py-16 sm:px-5 sm:py-20 lg:px-6">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-amber-500/25 bg-amber-500/10 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300">
                <IconScan className="h-8 w-8" />
              </span>
              <div>
                <h2 className="font-electric text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Got a serial?
                </h2>
                <p className="mt-1 max-w-md text-sm text-white/60">
                  Check packaging against our lot records, or send material to a partner lab for testing.
                </p>
              </div>
            </div>
            <ButtonLink
              to="/verify"
              className="shrink-0 rounded-full border-0 bg-amber-400 px-7 py-3 text-sm font-bold text-ink hover:bg-amber-300"
            >
              Test & verify →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-ink px-3 pb-28 pt-20 sm:px-5 sm:pb-32 sm:pt-24 lg:px-6">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_60%)]"
          aria-hidden
        />
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-electric text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl">
              Open the full store.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base text-white/55">
              Browse every listing with form filters, clear specs, and secure checkout.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink
                to="/catalog"
                className="rounded-full border-0 bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:opacity-95"
              >
                Browse the store
              </ButtonLink>
              <ButtonLink
                to="/catalog?application=injectable"
                className="rounded-full border border-white/20 bg-transparent px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10"
              >
                Start with injectable
              </ButtonLink>
            </div>
            <p className="mt-10 font-logo text-[10px] font-medium uppercase tracking-[0.22em] text-white/30">
              Laboratory research use only · Not for human consumption
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
