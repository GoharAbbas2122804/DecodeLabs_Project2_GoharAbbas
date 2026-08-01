import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';
import { sendSuccess } from '../utils/responseFormatter';
import { asyncHandler } from '../utils/asyncHandler';

export const getCommentsForPostHandler = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const { comments, meta } = await CommentService.getCommentsForPost(
    postId,
    page,
    limit
  );

  return sendSuccess(req, res, comments, 200, meta);
});

export const createCommentHandler = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const comment = await CommentService.createComment(
    postId,
    req.body,
    req.user!
  );

  return sendSuccess(req, res, comment, 201);
});

export const deleteCommentHandler = asyncHandler(async (req: Request, res: Response) => {
  const commentId = req.params.id as string;
  await CommentService.deleteComment(commentId, req.user!);
  return sendSuccess(req, res, null, 204);
});
