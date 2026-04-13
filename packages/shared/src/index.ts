import { z } from 'zod';

/** All available actions a user can be authorized to perform */
export const AVAILABLE_ACTIONS = ['create-item', 'delete-item', 'view-item', 'move-item'] as const;

export type Action = (typeof AVAILABLE_ACTIONS)[number];

/** Schema for creating a new user */
export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  actions: z
    .array(z.enum(AVAILABLE_ACTIONS))
    .default([])
    .describe('List of actions the user is allowed to perform'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Schema for updating a user (all fields optional) */
export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).trim().optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim().optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
  actions: z
    .array(z.enum(AVAILABLE_ACTIONS))
    .optional()
    .describe('List of actions the user is allowed to perform'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** Schema for executing an action */
export const executeActionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  action: z.enum(AVAILABLE_ACTIONS, {
    errorMap: () => ({
      message: `Invalid action. Must be one of: ${AVAILABLE_ACTIONS.join(', ')}`,
    }),
  }),
});

export type ExecuteActionInput = z.infer<typeof executeActionSchema>;

/** Full user entity as returned from the API */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  actions: Action[];
  createdAt: string;
  updatedAt: string;
}

/** Standard API error response */
export interface ApiError {
  error: string;
  details?: unknown;
}

/** Action execution response */
export interface ActionResponse {
  message: string;
  userId: string;
  action: Action;
  allowed: boolean;
}
