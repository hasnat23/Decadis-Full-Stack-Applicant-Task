import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { env } from '../config.js';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) return db;

  const resolvedPath = env.DATABASE_PATH;
  const dir = path.dirname(resolvedPath);

  // Ensure the data directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(resolvedPath);

  // Enable WAL mode for better concurrent performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initializeSchema(db);

  return db;
}

/** Create an in-memory database for testing */
export function createTestDatabase(): Database.Database {
  const testDb = new Database(':memory:');
  testDb.pragma('foreign_keys = ON');
  initializeSchema(testDb);
  return testDb;
}

function initializeSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      actions TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}

/** Close the database connection (useful for cleanup) */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
