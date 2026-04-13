import { UserService } from './user.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { getDatabase } from '../database/database.js';

/** Create a UserService wired to the singleton database */
export function createUserService(): UserService {
  return new UserService(new UserRepository(getDatabase()));
}
