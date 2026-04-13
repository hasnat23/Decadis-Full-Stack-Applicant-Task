import type Database from 'better-sqlite3';
import type { User, CreateUserInput, UpdateUserInput, Action } from '@app/shared';
import { v4 as uuidv4 } from 'uuid';

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  actions: string;
  created_at: string;
  updated_at: string;
}

/** Convert a database row to a User entity */
function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    actions: JSON.parse(row.actions) as Action[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UserRepository {
  constructor(private db: Database.Database) {}

  findAll(): User[] {
    const rows = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as UserRow[];
    return rows.map(rowToUser);
  }

  findById(id: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  findByEmail(email: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | UserRow
      | undefined;
    return row ? rowToUser(row) : null;
  }

  create(input: CreateUserInput): User {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO users (id, first_name, last_name, email, actions, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.firstName,
        input.lastName,
        input.email,
        JSON.stringify(input.actions),
        now,
        now,
      );

    return this.findById(id)!;
  }

  update(id: string, input: UpdateUserInput): User | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = {
      firstName: input.firstName ?? existing.firstName,
      lastName: input.lastName ?? existing.lastName,
      email: input.email ?? existing.email,
      actions: input.actions ?? existing.actions,
    };
    const now = new Date().toISOString();

    this.db
      .prepare(
        `UPDATE users SET first_name = ?, last_name = ?, email = ?, actions = ?, updated_at = ?
       WHERE id = ?`,
      )
      .run(
        updated.firstName,
        updated.lastName,
        updated.email,
        JSON.stringify(updated.actions),
        now,
        id,
      );

    return this.findById(id)!;
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  deleteAll(): void {
    this.db.prepare('DELETE FROM users').run();
  }
}
