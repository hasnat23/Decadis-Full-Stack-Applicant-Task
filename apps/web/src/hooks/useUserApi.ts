import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  ExecuteActionInput,
  ActionResponse,
} from '@app/shared';

const USERS_KEY = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => api.request<User[]>('/user'),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [...USERS_KEY, id],
    queryFn: () => api.request<User>(`/user/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      api.request<User>('/user', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) =>
      api.request<User>(`/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.request<void>(`/user/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useExecuteAction() {
  return useMutation({
    mutationFn: (data: ExecuteActionInput) =>
      api.request<ActionResponse>('/action', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}
