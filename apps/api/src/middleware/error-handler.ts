import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  NotFoundError,
  ConflictError,
  UnauthorizedActionError,
} from '../services/user.service.js';
import type { ApiError } from '@app/shared';

/** Global error handler middleware */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiError = {
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
    res.status(400).json(response);
    return;
  }

  // Not found
  if (err instanceof NotFoundError) {
    const response: ApiError = { error: err.message };
    res.status(404).json(response);
    return;
  }

  // Duplicate resource
  if (err instanceof ConflictError) {
    const response: ApiError = { error: err.message };
    res.status(409).json(response);
    return;
  }

  // Unauthorized action
  if (err instanceof UnauthorizedActionError) {
    const response: ApiError = { error: err.message };
    res.status(401).json(response);
    return;
  }

  // Unexpected errors
  console.error('Unhandled error:', err);
  const response: ApiError = { error: 'Internal server error' };
  res.status(500).json(response);
}
