import type { User, CreateUserInput, UpdateUserInput, Action, ActionResponse } from '@app/shared';
import type { UserRepository } from '../repositories/user.repository.js';

export class UserService {
  constructor(private repo: UserRepository) {}

  getAllUsers(): User[] {
    return this.repo.findAll();
  }

  getUserById(id: string): User | null {
    return this.repo.findById(id);
  }

  createUser(input: CreateUserInput): User {
    // Check for duplicate email
    const existing = this.repo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(`A user with email "${input.email}" already exists`);
    }
    return this.repo.create(input);
  }

  updateUser(id: string, input: UpdateUserInput): User {
    const existing = this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`User with id "${id}" not found`);
    }

    // If email is being changed, check for duplicates
    if (input.email && input.email !== existing.email) {
      const emailTaken = this.repo.findByEmail(input.email);
      if (emailTaken) {
        throw new ConflictError(`A user with email "${input.email}" already exists`);
      }
    }

    return this.repo.update(id, input)!;
  }

  deleteUser(id: string): void {
    const deleted = this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with id "${id}" not found`);
    }
  }

  executeAction(userId: string, action: Action): ActionResponse {
    const user = this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with id "${userId}" not found`);
    }

    const allowed = user.actions.includes(action);

    if (!allowed) {
      throw new UnauthorizedActionError(
        `User "${user.firstName} ${user.lastName}" is not allowed to perform action "${action}"`,
        userId,
        action,
      );
    }

    return {
      message: `Action "${action}" executed successfully by ${user.firstName} ${user.lastName}`,
      userId,
      action,
      allowed: true,
    };
  }
}

/** Custom error for resource not found */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Custom error for duplicate resources */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/** Custom error for unauthorized actions */
export class UnauthorizedActionError extends Error {
  public userId: string;
  public action: Action;

  constructor(message: string, userId: string, action: Action) {
    super(message);
    this.name = 'UnauthorizedActionError';
    this.userId = userId;
    this.action = action;
  }
}
