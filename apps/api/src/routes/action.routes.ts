import type { Request, Response, NextFunction } from 'express';
import { executeActionSchema } from '@app/shared';
import { createUserService } from '../services/create-user-service.js';
import { validate } from '../middleware/validate.js';
import { Router } from 'express';

export const actionRouter = Router();

// POST /action — execute an action for a user
actionRouter.post(
  '/',
  validate(executeActionSchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = createUserService();
      const result = service.executeAction(req.body.userId, req.body.action);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
);
