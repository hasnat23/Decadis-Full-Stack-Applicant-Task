import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/users" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg text-white shadow-sm">
              👥
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              User<span className="text-indigo-600">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/users" current={location.pathname} exact>
              All Users
            </NavLink>
            <NavLink to="/users/new" current={location.pathname}>
              + New User
            </NavLink>
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 sm:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <nav className="border-t border-gray-100 px-4 pb-3 pt-2 sm:hidden">
            <div className="flex flex-col gap-1">
              <MobileNavLink
                to="/users"
                current={location.pathname}
                exact
                onClick={() => setMobileOpen(false)}
              >
                All Users
              </MobileNavLink>
              <MobileNavLink
                to="/users/new"
                current={location.pathname}
                onClick={() => setMobileOpen(false)}
              >
                + New User
              </MobileNavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-400">
            UserHub &middot; Decadis Full-Stack Task
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  to,
  current,
  children,
  exact,
}: {
  to: string;
  current: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const isActive = exact ? current === to : current.startsWith(to);
  return (
    <Link
      to={to}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  current,
  children,
  exact,
  onClick,
}: {
  to: string;
  current: string;
  children: React.ReactNode;
  exact?: boolean;
  onClick: () => void;
}) {
  const isActive = exact ? current === to : current.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
}
