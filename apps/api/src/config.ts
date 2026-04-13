import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATABASE_PATH: process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'database.db'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
} as const;
