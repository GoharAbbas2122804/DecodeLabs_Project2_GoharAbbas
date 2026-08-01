import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred on the server';
  let details: any[] | undefined = undefined;

  // 1. Zod Validation Error (Syntactic Failure)
  if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Syntactic validation failure: invalid request payload';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
  }
  // 2. Custom ApiError (Operational Failure)
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  }
  // 3. JSON Syntax Error
  else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Malformed JSON neurotransmitter payload';
  }
  // 4. Prisma Known Request Error or other unhandled errors
  else {
    logger.error(`[Unhandled Error] [${req.requestId}] ${err.stack || err.message}`);
    if (env.NODE_ENV === 'development') {
      message = err.message;
    }
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown-request-id',
    },
  });
};
