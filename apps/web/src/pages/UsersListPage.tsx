import { Link } from 'react-router-dom';
import { useUsers, useDeleteUser } from '../hooks/useUserApi';
import { ActionBadge } from '../components/ActionBadge';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import toast from 'react-hot-toast';
import type { User } from '@app/shared';

function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
      {initials}
    </span>
  );
}

export function UsersListPage() {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    deleteUser.mutate(id, {
      onSuccess: () => toast.success(`${name} deleted`),
      onError: (err) => toast.error(err.message),
    });
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message={error.message} />;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {users?.length === 0
              ? 'Get started by creating your first user.'
              : `${users?.length} user${(users?.length ?? 0) !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Link
          to="/users/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New User
        </Link>
      </div>

      {users?.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop table — hidden on mobile */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Permissions
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={user.firstName} lastName={user.lastName} />
                        <span className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.actions.length > 0 ? (
                          user.actions.map((a) => <ActionBadge key={a} action={a} />)
                        ) : (
                          <span className="text-xs italic text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <RowActions
                        user={user}
                        onDelete={handleDelete}
                        isPending={deleteUser.isPending}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list — visible only on mobile */}
          <div className="space-y-3 md:hidden">
            {users?.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={user.firstName} lastName={user.lastName} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                {user.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {user.actions.map((a) => (
                      <ActionBadge key={a} action={a} />
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <Link
                    to={`/users/${user.id}`}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </Link>
                  <Link
                    to={`/users/${user.id}/edit`}
                    className="flex-1 rounded-lg bg-indigo-50 px-3 py-2 text-center text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                    disabled={deleteUser.isPending}
                    className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RowActions({
  user,
  onDelete,
  isPending,
}: {
  user: User;
  onDelete: (id: string, name: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
      <Link
        to={`/users/${user.id}`}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        View
      </Link>
      <Link
        to={`/users/${user.id}/edit`}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800"
      >
        Edit
      </Link>
      <button
        onClick={() => onDelete(user.id, `${user.firstName} ${user.lastName}`)}
        disabled={isPending}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <svg
          className="h-7 w-7 text-indigo-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-900">No users yet</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating your first user.</p>
      <Link
        to="/users/new"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create User
      </Link>
    </div>
  );
}
