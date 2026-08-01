import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { apiRateLimiter } from './middleware/rateLimiter';
import { assignRequestId, morganMiddleware } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { ApiError } from './utils/apiError';

export const createApp = (): Express => {
  const app = express();

  // 1. Security Headers (Helmet)
  app.use(helmet());

  // 2. Cross-Origin Resource Sharing (CORS)
  app.use(cors());

  // 3. API Gateway Rate Limiting
  app.use('/api', apiRateLimiter);

  // 4. Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Request Identification & Logging
  app.use(assignRequestId);
  app.use(morganMiddleware);

  // 6. Interactive API Documentation (Swagger UI)
  setupSwagger(app);

  // 7. Master API Gateway Router
  app.use('/api/v1', routes);

  // 8. 404 Handler for Unmatched Pathways
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(ApiError.notFound(`Path '${req.originalUrl}' not found on this Nervous System gateway`));
  });

  // 9. Centralized Error Handling Middleware (Blood-Brain Barrier output filter)
  app.use(errorHandler);

  return app;
};
