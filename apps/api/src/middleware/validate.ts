import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/** Middleware factory that validates request body against a Zod schema */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
