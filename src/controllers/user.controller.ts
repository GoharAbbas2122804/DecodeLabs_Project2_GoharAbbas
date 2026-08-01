import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/responseFormatter';
import { asyncHandler } from '../utils/asyncHandler';

export const getUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const { users, meta } = await UserService.getUsers(page, limit);
  return sendSuccess(req, res, users, 200, meta);
});

export const getUserByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const user = await UserService.getUserById(userId, req.user);
  return sendSuccess(req, res, user, 200);
});

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const updatedUser = await UserService.updateUser(userId, req.body, req.user!);
  return sendSuccess(req, res, updatedUser, 200);
});

export const deleteUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  await UserService.deleteUser(userId, req.user!);
  return sendSuccess(req, res, null, 204);
});
