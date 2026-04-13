import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UsersListPage } from './pages/UsersListPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { EditUserPage } from './pages/EditUserPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/users/new" element={<CreateUserPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/users/:id/edit" element={<EditUserPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h1 className="text-5xl font-extrabold text-gray-300">404</h1>
      <p className="mt-3 text-lg font-medium text-gray-600">Page not found</p>
      <p className="mt-1 text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/users"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Users
      </a>
    </div>
  );
}
