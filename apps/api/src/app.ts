import express from 'express';
import cors from 'cors';
import { env } from './config.js';
import { userRouter } from './routes/user.routes.js';
import { actionRouter } from './routes/action.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/user', userRouter);
app.use('/action', actionRouter);

// Global error handler
app.use(errorHandler);
