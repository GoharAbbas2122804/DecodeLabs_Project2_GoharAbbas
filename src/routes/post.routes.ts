import { Router } from 'express';
import {
  getPostsHandler,
  createPostHandler,
  getPostByIdHandler,
  updatePostHandler,
  deletePostHandler,
} from '../controllers/post.controller';
import {
  getCommentsForPostHandler,
  createCommentHandler,
} from '../controllers/comment.controller';
import { validate } from '../middleware/validate';
import {
  uuidParamSchema,
  paginationQuerySchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
} from '../validation/schemas';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  optionalAuth,
  validate({ query: paginationQuerySchema }),
  getPostsHandler
);

router.post(
  '/',
  requireAuth,
  validate({ body: createPostSchema }),
  createPostHandler
);

router.get(
  '/:id',
  optionalAuth,
  validate({ params: uuidParamSchema }),
  getPostByIdHandler
);

router.put(
  '/:id',
  requireAuth,
  validate({ params: uuidParamSchema, body: updatePostSchema }),
  updatePostHandler
);

router.delete(
  '/:id',
  requireAuth,
  validate({ params: uuidParamSchema }),
  deletePostHandler
);

// Nested Comments Endpoints under Posts
router.get(
  '/:id/comments',
  validate({ params: uuidParamSchema, query: paginationQuerySchema }),
  getCommentsForPostHandler
);

router.post(
  '/:id/comments',
  requireAuth,
  validate({ params: uuidParamSchema, body: createCommentSchema }),
  createCommentHandler
);

export default router;
