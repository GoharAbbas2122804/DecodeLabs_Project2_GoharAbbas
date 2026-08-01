import { Router } from 'express';
import {
  getUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/user.controller';
import { getPostsByUserIdHandler } from '../controllers/post.controller';
import { validate } from '../middleware/validate';
import {
  uuidParamSchema,
  paginationQuerySchema,
  updateUserSchema,
} from '../validation/schemas';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  validate({ query: paginationQuerySchema }),
  getUsersHandler
);

router.get(
  '/:id',
  optionalAuth,
  validate({ params: uuidParamSchema }),
  getUserByIdHandler
);

router.put(
  '/:id',
  requireAuth,
  validate({ params: uuidParamSchema, body: updateUserSchema }),
  updateUserHandler
);

router.delete(
  '/:id',
  requireAuth,
  validate({ params: uuidParamSchema }),
  deleteUserHandler
);

router.get(
  '/:id/posts',
  optionalAuth,
  validate({ params: uuidParamSchema, query: paginationQuerySchema }),
  getPostsByUserIdHandler
);

export default router;
