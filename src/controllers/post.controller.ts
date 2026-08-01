import { Request, Response } from 'express';
import { PostService } from '../services/post.service';
import { sendSuccess } from '../utils/responseFormatter';
import { asyncHandler } from '../utils/asyncHandler';
import { PostStatus } from '../types';

export const getPostsHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const mine = req.query.mine === 'true';
  const statusFilter = req.query.status as PostStatus | undefined;

  const { posts, meta } = await PostService.getPosts(
    page,
    limit,
    mine,
    statusFilter,
    req.user
  );

  return sendSuccess(req, res, posts, 200, meta);
});

export const createPostHandler = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostService.createPost(req.body, req.user!);
  return sendSuccess(req, res, post, 201);
});

export const getPostByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const post = await PostService.getPostById(postId, req.user);
  return sendSuccess(req, res, post, 200);
});

export const updatePostHandler = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const updatedPost = await PostService.updatePost(postId, req.body, req.user!);
  return sendSuccess(req, res, updatedPost, 200);
});

export const deletePostHandler = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  await PostService.deletePost(postId, req.user!);
  return sendSuccess(req, res, null, 204);
});

export const getPostsByUserIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const { posts, meta } = await PostService.getPostsByUserId(
    userId,
    page,
    limit,
    req.user
  );

  return sendSuccess(req, res, posts, 200, meta);
});
