import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { AppConfig } from './config.js';
import type { Container } from './container.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { vehicleRoutes } from './routes/vehicleRoutes.js';

/** Builds the Express application. All dependencies arrive through the container. */
export function createApp(container: Container, config: AppConfig): Express {
  const app = express();
  const requireAuth = authenticate(container.tokenService);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors(config.corsOrigin ? { origin: config.corsOrigin.split(',') } : undefined));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/auth', authRoutes(container.authService, requireAuth));
  app.use('/api/vehicles', vehicleRoutes(container.vehicleService, requireAuth));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
