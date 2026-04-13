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
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/users" className="hover:text-indigo-600">
          Users
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">Create</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New User</h1>
        <p className="mt-1 text-sm text-gray-500">Fill in the details below to add a new user.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <UserForm
          onSubmit={handleSubmit}
          isSubmitting={createUser.isPending}
          submitLabel="Create User"
        />
      </div>
    </div>
  );
}
