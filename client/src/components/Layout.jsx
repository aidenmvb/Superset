import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext';
import { useCart } from '../cartContext';
import { cn } from '../lib/cn';
import AgeGate from './AgeGate';
import { Container, Logo } from './ui';

export default function Layout() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [heroPast, setHeroPast] = useState(false);

  // On home: transparent over photo until user scrolls past the first viewport.
  useEffect(() => {
    if (!isHome) {
      setHeroPast(false);
      return undefined;
    }
    const onScroll = () => setHeroPast(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const overlay = isHome && !heroPast;

  const navClass = ({ isActive }) =>
    cn(
      'inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.98]',
      overlay
        ? isActive
          ? 'border-white/40 bg-white text-ink shadow-black/20'
          : 'border-white/20 bg-white/10 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/20'
        : isActive
          ? 'border-teal/40 bg-gradient-to-r from-teal to-violet text-white shadow-teal/20 ring-2 ring-teal/20'
          : 'border-paper-line bg-white text-graphite hover:border-teal/35 hover:bg-mint hover:text-teal-deep hover:shadow-md'
    );

  return (
    <div className="flex min-h-screen flex-col">
      <AgeGate />

      {/* Promo strip sits under the hero chrome on home so the first screen is pure brand. */}
      {!isHome && (
        <div className="promo-shimmer px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:text-[13px]">
          Research use only · High purity ·{' '}
          <Link
            to="/verify"
            className="underline decoration-white/70 underline-offset-2 hover:decoration-white"
          >
            Test & verify
          </Link>
        </div>
      )}

      <header
        className={cn(
          'z-50 transition-colors duration-300',
          isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0',
          overlay
            ? 'border-b border-transparent bg-gradient-to-b from-ink/55 via-ink/25 to-transparent'
            : 'border-b border-paper-line/80 bg-white/95 backdrop-blur-md'
        )}
      >
        <Container wide>
          <nav className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
            <Link to="/" className="shrink-0">
              <Logo light={overlay} />
            </Link>

            <div
              className={cn(
                'hidden items-center gap-2 rounded-full p-1.5 md:flex',
                overlay
                  ? 'border border-white/15 bg-white/5 backdrop-blur-md'
                  : 'border border-paper-line bg-paper-dim/80'
              )}
            >
              <NavLink to="/catalog" className={navClass}>
                Store
              </NavLink>
              <NavLink to="/verify" className={navClass}>
                Test & verify
              </NavLink>
              <NavLink to="/contact" className={navClass}>
                Contact
              </NavLink>
            </div>

            <div className="flex flex-1 items-center justify-center gap-1.5 overflow-x-auto md:hidden">
              <NavLink to="/catalog" className={navClass}>
                Store
              </NavLink>
              <NavLink to="/verify" className={navClass}>
                Test
              </NavLink>
              <NavLink to={isAuthenticated ? '/account' : '/account/login'} className={navClass}>
                Account
              </NavLink>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isAuthenticated ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    to="/account"
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-semibold transition',
                      overlay
                        ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                        : 'border-paper-line bg-white text-ink hover:border-teal/40 hover:bg-mint'
                    )}
                  >
                    {user?.name?.split(' ')[0] || 'Account'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className={cn(
                      'rounded-full px-2 py-2 text-xs font-semibold',
                      overlay ? 'text-white/70 hover:text-white' : 'text-graphite-soft hover:text-ink'
                    )}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  to="/account/login"
                  className={cn(
                    'hidden rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:inline-flex',
                    overlay
                      ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                      : 'border-paper-line bg-white text-ink hover:border-teal/40 hover:bg-mint'
                  )}
                >
                  Sign in
                </Link>
              )}
              <Link
                to="/cart"
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition active:scale-[0.98]',
                  overlay
                    ? 'border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                    : 'border-paper-line bg-white text-ink hover:border-teal/40 hover:bg-mint hover:shadow-md'
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
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
                High-purity research peptides for qualified laboratories. Clear specs, careful
                packaging, research use only.
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
              <Link className="mb-2 block text-sm text-ink hover:text-teal-deep" to="/account">
                Account
              </Link>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite-soft">
                Company
              </h4>
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
            <span>© {new Date().getFullYear()} Vantril Research</span>
            <span>Research use only · Not for human consumption</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
