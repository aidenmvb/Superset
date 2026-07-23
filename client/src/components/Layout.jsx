import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../cartContext';
import { cn } from '../lib/cn';
import AgeGate from './AgeGate';
import { Container, Logo } from './ui';

const navClass = ({ isActive }) =>
  cn(
    'inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.98]',
    isActive
      ? 'border-teal/40 bg-gradient-to-r from-teal to-violet text-white shadow-teal/20 ring-2 ring-teal/20'
      : 'border-paper-line bg-white text-graphite hover:border-teal/35 hover:bg-mint hover:text-teal-deep hover:shadow-md'
  );

export default function Layout() {
  const { itemCount } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <AgeGate />

      <div className="promo-shimmer px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:text-[13px]">
        Research use only · 99%+ purity · Third-party tested ·{' '}
        <Link to="/verify" className="underline decoration-white/70 underline-offset-2 hover:decoration-white">
          Test & verify
        </Link>
      </div>

      <header className="sticky top-0 z-50 border-b border-paper-line/80 bg-white/95 backdrop-blur-md">
        <Container wide>
          <nav className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-paper-line bg-paper-dim/80 p-1.5 md:flex">
              <NavLink to="/catalog" className={navClass}>
                Store
              </NavLink>
              <NavLink to="/verify" className={navClass}>
                Test & verify
              </NavLink>
              <NavLink to="/about" className={navClass}>
                Quality
              </NavLink>
              <NavLink to="/contact" className={navClass}>
                Contact
              </NavLink>
            </div>

            {/* Mobile nav buttons */}
            <div className="flex flex-1 items-center justify-center gap-1.5 overflow-x-auto md:hidden">
              <NavLink to="/catalog" className={navClass}>
                Store
              </NavLink>
              <NavLink to="/verify" className={navClass}>
                Test
              </NavLink>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/cart"
                className="relative inline-flex items-center gap-2 rounded-full border border-paper-line bg-white px-4 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-teal/40 hover:bg-mint hover:shadow-md active:scale-[0.98]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-ink"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.5 5h1.6l1.4 10.2a1.5 1.5 0 0 0 1.5 1.3h8.7a1.5 1.5 0 0 0 1.5-1.2L19.5 8H7"
                  />
                  <circle cx="10" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
                  <circle cx="16.5" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
                </svg>
                Cart
                {itemCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-teal to-cyan px-1.5 text-[11px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </Container>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-paper-line bg-white">
        <Container wide className="py-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-graphite-soft">
                Research peptides for qualified laboratories. Lot verification, clear specs, and a
                live inventory API.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-soft">
                Shop
              </h4>
              <Link className="mb-2 block text-sm text-ink hover:text-teal-deep" to="/catalog">
                Store
              </Link>
              <Link className="mb-2 block text-sm text-ink hover:text-teal-deep" to="/verify">
                Test & verify
              </Link>
              <Link className="mb-2 block text-sm text-ink hover:text-teal-deep" to="/cart">
                Cart
              </Link>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-soft">
                Company
              </h4>
              <Link className="mb-2 block text-sm text-ink hover:text-teal-deep" to="/about">
                Quality
              </Link>
              <Link className="mb-2 block text-sm text-ink hover:text-teal-deep" to="/contact">
                Contact
              </Link>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-soft">
                Legal
              </h4>
              <p className="text-sm text-graphite-soft">
                For laboratory research only. Not for human or veterinary use.
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-paper-line pt-6 text-xs text-graphite-soft">
            <span>© {new Date().getFullYear()} Vireon Research</span>
            <span>Research use only · Not for human consumption</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
