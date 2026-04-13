import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AVAILABLE_ACTIONS } from '@app/shared';

/** Form-specific schema: all fields required (no .default() transform issues) */
const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  actions: z.array(z.enum(AVAILABLE_ACTIONS)),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (data: UserFormValues) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

const inputBase =
  'block w-full rounded-xl border bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

export function UserForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      actions: [],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            className={`${inputBase} ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1.5 text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            className={`${inputBase} ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1.5 text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </span>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`${inputBase} pl-10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}`}
            placeholder="john@example.com"
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Actions (checkbox cards) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Allowed Actions</label>
        <p className="mb-3 text-xs text-gray-500">
          Select the actions this user is permitted to perform.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AVAILABLE_ACTIONS.map((action) => (
            <label
              key={action}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm hover:border-gray-300 hover:bg-gray-50 has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50 has-[:checked]:text-indigo-700"
            >
              <input
                type="checkbox"
                value={action}
                {...register('actions')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">{formatAction(action)}</span>
            </label>
          ))}
        </div>
        {errors.actions && <p className="mt-1.5 text-xs text-red-600">{errors.actions.message}</p>}
      </div>

      <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

function formatAction(action: string): string {
  return action
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
