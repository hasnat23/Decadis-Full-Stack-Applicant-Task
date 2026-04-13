import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser, useDeleteUser, useExecuteAction } from '../hooks/useUserApi';
import { AVAILABLE_ACTIONS, type Action } from '@app/shared';
import { ActionBadge } from '../components/ActionBadge';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ApiError } from '../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

function formatAction(action: string): string {
  return action
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

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

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/users" className="hover:text-indigo-600">
          Users
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </span>
      </nav>

      {/* Profile header */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-md">
            {initials}
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/users/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteUser.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {deleteUser.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Info Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            User Information
          </h2>

          <dl className="space-y-4">
            <InfoRow label="First Name" value={user.firstName} />
            <InfoRow label="Last Name" value={user.lastName} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Created" value={new Date(user.createdAt).toLocaleString()} />
          </dl>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Allowed Actions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.actions.length > 0 ? (
                user.actions.map((a) => <ActionBadge key={a} action={a} />)
              ) : (
                <span className="text-sm italic text-gray-400">No actions assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Execute Action Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-900">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Execute Action
          </h2>
          <p className="mb-5 text-sm text-gray-500">
            Run an action to test whether this user is authorized.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AVAILABLE_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleRunAction(action)}
                disabled={executeAction.isPending}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
              >
                {formatAction(action)}
              </button>
            ))}
          </div>

          {/* Action Result */}
          {actionResult && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-xl p-4 text-sm ${
                actionResult.type === 'success'
                  ? 'border border-green-200 bg-green-50 text-green-800'
                  : 'border border-red-200 bg-red-50 text-red-800'
              }`}
              role="alert"
            >
              <span className="mt-0.5 shrink-0 text-base">
                {actionResult.type === 'success' ? '✅' : '🚫'}
              </span>
              <div>
                <p className="font-semibold">
                  {actionResult.type === 'success' ? 'Action Succeeded' : 'Action Denied'}
                </p>
                <p className="mt-0.5 text-sm opacity-80">{actionResult.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
