import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser, useDeleteUser, useExecuteAction } from '../hooks/useUserApi';
import { AVAILABLE_ACTIONS, type Action } from '@app/shared';
import { ActionBadge } from '../components/ActionBadge';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ApiError } from '../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id!);
  const deleteUser = useDeleteUser();
  const executeAction = useExecuteAction();
  const [actionResult, setActionResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleDelete = () => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`))
      return;

    deleteUser.mutate(id!, {
      onSuccess: () => {
        toast.success('User deleted');
        navigate('/users');
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleRunAction = (action: Action) => {
    setActionResult(null);
    executeAction.mutate(
      { userId: id!, action },
      {
        onSuccess: (res) => {
          setActionResult({ type: 'success', message: res.message });
        },
        onError: (err) => {
          const message = err instanceof ApiError ? err.message : 'Action failed';
          setActionResult({ type: 'error', message });
        },
      },
    );
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!user) return <ErrorAlert message="User not found" />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.firstName} {user.lastName}
        </h1>
        <div className="flex gap-2">
          <Link
            to={`/users/${id}/edit`}
            className="rounded-lg bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            {deleteUser.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* User Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">User Information</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">First Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.firstName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <dt className="text-sm font-medium text-gray-500">Allowed Actions</dt>
            <dd className="mt-2 flex flex-wrap gap-1">
              {user.actions.length > 0 ? (
                user.actions.map((a) => <ActionBadge key={a} action={a} />)
              ) : (
                <span className="text-sm text-gray-400">No actions assigned</span>
              )}
            </dd>
          </div>
        </div>

        {/* Run Action Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Execute Action</h2>
          <p className="mb-4 text-sm text-gray-500">
            Select an action to execute for this user. The system will check whether the user is
            authorized.
          </p>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleRunAction(action)}
                disabled={executeAction.isPending}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Action Result */}
          {actionResult && (
            <div
              className={`mt-4 rounded-lg p-4 text-sm ${
                actionResult.type === 'success'
                  ? 'border border-green-200 bg-green-50 text-green-800'
                  : 'border border-red-200 bg-red-50 text-red-800'
              }`}
              role="alert"
            >
              <strong>{actionResult.type === 'success' ? '✅ Success:' : '❌ Denied:'}</strong>{' '}
              {actionResult.message}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link to="/users" className="text-sm text-indigo-600 hover:underline">
          ← Back to users
        </Link>
      </div>
    </div>
  );
}
