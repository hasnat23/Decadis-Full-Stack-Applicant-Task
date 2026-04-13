import { useNavigate, Link } from 'react-router-dom';
import { useCreateUser } from '../hooks/useUserApi';
import { UserForm } from '../components/UserForm';
import toast from 'react-hot-toast';
import type { CreateUserInput } from '@app/shared';

export function CreateUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const handleSubmit = (data: CreateUserInput) => {
    createUser.mutate(data, {
      onSuccess: (user) => {
        toast.success(`${user.firstName} ${user.lastName} created!`);
        navigate(`/users/${user.id}`);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        <Link to="/users" className="text-sm text-indigo-600 hover:underline">
          ← Cancel
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <UserForm
          onSubmit={handleSubmit}
          isSubmitting={createUser.isPending}
          submitLabel="Create User"
        />
      </div>
    </div>
  );
}
