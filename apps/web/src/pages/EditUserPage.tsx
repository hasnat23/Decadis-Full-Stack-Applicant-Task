import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser, useUpdateUser } from '../hooks/useUserApi';
import { UserForm } from '../components/UserForm';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import toast from 'react-hot-toast';
import type { UpdateUserInput } from '@app/shared';

export function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id!);
  const updateUser = useUpdateUser(id!);

  const handleSubmit = (data: UpdateUserInput) => {
    updateUser.mutate(data, {
      onSuccess: (updated) => {
        toast.success(`${updated.firstName} ${updated.lastName} updated!`);
        navigate(`/users/${id}`);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!user) return <ErrorAlert message="User not found" />;

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
        <Link to={`/users/${id}`} className="hover:text-indigo-600">
          {user.firstName} {user.lastName}
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">Edit</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Edit {user.firstName} {user.lastName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Update the user details below.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <UserForm
          defaultValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            actions: user.actions,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateUser.isPending}
          submitLabel="Update User"
        />
      </div>
    </div>
  );
}
