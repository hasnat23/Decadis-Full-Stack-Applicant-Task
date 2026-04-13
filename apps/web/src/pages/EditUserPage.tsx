import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser, useUpdateUser } from '../hooks/useUserApi';
import { UserForm } from '../components/UserForm';
import { Spinner } from '../components/Spinner';
import { ErrorAlert } from '../components/ErrorAlert';
import toast from 'react-hot-toast';
import type { CreateUserInput } from '@app/shared';

export function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id!);
  const updateUser = useUpdateUser(id!);

  const handleSubmit = (data: CreateUserInput) => {
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit {user.firstName} {user.lastName}
        </h1>
        <Link to={`/users/${id}`} className="text-sm text-indigo-600 hover:underline">
          ← Back to detail
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
