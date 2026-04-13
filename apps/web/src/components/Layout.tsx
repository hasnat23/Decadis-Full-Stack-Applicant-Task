import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/users" className="text-xl font-bold text-indigo-600">
            👥 User Management
          </Link>
          <nav className="flex gap-4">
            <NavLink to="/users" current={location.pathname} exact>
              All Users
            </NavLink>
            <NavLink to="/users/new" current={location.pathname}>
              + New User
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
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
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
}
