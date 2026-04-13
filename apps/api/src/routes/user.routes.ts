import type { Request, Response, NextFunction } from 'express';
import { createUserSchema, updateUserSchema } from '@app/shared';
import { UserService } from '../services/user.service.js';
import { validate } from '../middleware/validate.js';
import { Router } from 'express';
import { getDatabase } from '../database/database.js';
import { UserRepository } from '../repositories/user.repository.js';

export const userRouter = Router();

function getService(): UserService {
  return new UserService(new UserRepository(getDatabase()));
}

// POST /user — create a user
userRouter.post(
  '/',
  validate(createUserSchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = getService();
      const user = service.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },
);

// GET /user — fetch all users
userRouter.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const service = getService();
    const users = service.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /user/:id — fetch one user
userRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = getService();
    const id = req.params.id as string;
    const user = service.getUserById(id);
    if (!user) {
      res.status(404).json({ error: `User with id "${id}" not found` });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /user/:id — update a user
userRouter.put(
  '/:id',
  validate(updateUserSchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = getService();
      const id = req.params.id as string;
      const user = service.updateUser(id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /user/:id — delete a user
userRouter.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = getService();
    const id = req.params.id as string;
    service.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
