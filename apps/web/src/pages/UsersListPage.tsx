import { Link } from 'react-router-dom';
import { useUsers, useDeleteUser } from '../hooks/useUserApi';
import { ActionBadge } from '../components/ActionBadge';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import toast from 'react-hot-toast';

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Link
          to="/users/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          + New User
        </Link>
      </div>

      {users?.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
          <p className="text-gray-500">No users yet.</p>
          <Link
            to="/users/new"
            className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
          >
            Create the first user →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.actions.length > 0 ? (
                        user.actions.map((a) => <ActionBadge key={a} action={a} />)
                      ) : (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/users/${user.id}`}
                        className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        View
                      </Link>
                      <Link
                        to={`/users/${user.id}/edit`}
                        className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
