import express, { Application } from 'express';
import cors from 'cors';
import { config } from './core/config/env.config';
import { requestLogger } from './core/middleware/logger.middleware';
import { errorHandler } from './core/middleware/error.middleware';
import { ApiResponse } from './core/utils/response.util';

// Import Feature Routes
import { authRoutes } from './modules/auth/auth.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { financeRoutes } from './modules/finances/finance.routes';
import { taskRoutes } from './modules/tasks/task.routes';
import { projectRoutes } from './modules/projects/project.routes';
import { chatRoutes } from './modules/chat/chat.routes';
import { realtimeRoutes } from './modules/realtime/realtime.routes';

export const createApp = (): Application => {
  const app = express();

  // Core Middlewares
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(requestLogger);

  // Health Check
  app.get('/health', (req, res) => {
    res.json(ApiResponse.success({
      status: 'UP',
      environment: config.env,
      platform: 'macOS Personal AI OS Backend',
      version: '3.0.0'
    }));
  });

  // Mount API Module Routers under /api/v1
  const apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/ai', aiRoutes);
  apiRouter.use('/finances', financeRoutes);
  apiRouter.use('/tasks', taskRoutes);
  apiRouter.use('/projects', projectRoutes);
  apiRouter.use('/chats', chatRoutes);
  apiRouter.use('/realtime', realtimeRoutes);

  app.use(config.apiPrefix, apiRouter);

  // Centralized Global Error Handler
  app.use(errorHandler);

  return app;
};
