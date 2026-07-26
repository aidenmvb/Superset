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
  // Site-wide dark chrome — matches homepage canvas
  const darkChrome = true;

  const navClass = ({ isActive }) =>
    cn(
      'inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.98]',
      isActive
        ? 'border-white/40 bg-white text-ink shadow-black/20'
        : 'border-white/20 bg-white/10 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/20'
    );

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <AgeGate />

      {/* Promo strip off home only — still dark-friendly */}
      {!isHome && (
        <div className="border-b border-white/10 bg-ink-soft/80 px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white/80 sm:text-[13px]">
          Research use only · High purity ·{' '}
          <Link
            to="/verify"
            className="text-white underline decoration-white/50 underline-offset-2 hover:decoration-white"
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
            : 'border-b border-white/10 bg-ink/90 backdrop-blur-md'
        )}
      >
        <Container wide>
          <nav className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
            <Link to="/" className="shrink-0">
              <Logo light />
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 backdrop-blur-md md:flex">
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
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    {user?.name?.split(' ')[0] || 'Account'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="rounded-full px-2 py-2 text-xs font-semibold text-white/70 hover:text-white"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  to="/account/login"
                  className="hidden rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:inline-flex"
                >
                  Sign in
                </Link>
              )}
              <Link
                to="/cart"
                className="relative inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]"
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

      <footer className="mt-auto border-t border-white/10 bg-ink text-white">
        <Container wide className="py-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo light />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
                High-purity research peptides for qualified laboratories. Clear specs, careful
                packaging, research use only.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Shop
              </h4>
              {[
                ['/catalog', 'Store'],
                ['/verify', 'Test & verify'],
                ['/cart', 'Cart'],
                ['/account', 'Account'],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  className="mb-2 block text-sm text-white/75 transition hover:text-white"
                  to={to}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Company
              </h4>
              <Link className="mb-2 block text-sm text-white/75 transition hover:text-white" to="/contact">
                Contact
              </Link>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Legal
              </h4>
              <p className="text-sm text-white/55">
                For laboratory research only. Not for human or veterinary use.
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/40">
            <span>© {new Date().getFullYear()} Vantril Research</span>
            <span>Research use only · Not for human consumption</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
