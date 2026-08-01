import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Global API rate limit exceeded. Please try again later.'));
  },
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Authentication rate limit exceeded. Please try again later.'));
  },
});
