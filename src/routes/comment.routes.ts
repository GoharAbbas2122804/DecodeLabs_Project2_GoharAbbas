import { Router } from 'express';
import { deleteCommentHandler } from '../controllers/comment.controller';
import { validate } from '../middleware/validate';
import { uuidParamSchema } from '../validation/schemas';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.delete(
  '/:id',
  requireAuth,
  validate({ params: uuidParamSchema }),
  deleteCommentHandler
);

export default router;
