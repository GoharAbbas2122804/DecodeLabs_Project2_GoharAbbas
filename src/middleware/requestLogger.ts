import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { randomUUID } from 'crypto';
import { logger } from '../config/logger';

export const assignRequestId = (req: Request, _res: Response, next: NextFunction) => {
  req.requestId = (req.headers['x-request-id'] as string) || randomUUID();
  next();
};

export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  }
);
