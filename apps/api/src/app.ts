import express from 'express';
import cors from 'cors';
import { env } from './config.js';
import { userRouter } from './routes/user.routes.js';
import { actionRouter } from './routes/action.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/users', userRouter);
app.use('/action', actionRouter);

// 404 catch-all for undefined routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use(errorHandler);
