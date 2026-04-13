import type { Request, Response, NextFunction } from 'express';
import { executeActionSchema } from '@app/shared';
import { UserService } from '../services/user.service.js';
import { validate } from '../middleware/validate.js';
import { Router } from 'express';
import { getDatabase } from '../database/database.js';
import { UserRepository } from '../repositories/user.repository.js';

export const actionRouter = Router();

function getService(): UserService {
  const db = getDatabase();
  const repo = new UserRepository(db);
  return new UserService(repo);
}

// POST /action — execute an action for a user
actionRouter.post(
  '/',
  validate(executeActionSchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = getService();
      const result = service.executeAction(req.body.userId, req.body.action);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
);
