import { Router } from 'express';
import { registerHandler, loginHandler, meHandler } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/schemas';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  registerHandler
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  loginHandler
);

router.get(
  '/me',
  requireAuth,
  meHandler
);

export default router;
