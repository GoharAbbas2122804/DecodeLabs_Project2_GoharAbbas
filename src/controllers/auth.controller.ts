import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/responseFormatter';
import { asyncHandler } from '../utils/asyncHandler';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  return sendSuccess(req, res, result, 201);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  return sendSuccess(req, res, result, 200);
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.getMe(req.user!.userId);
  return sendSuccess(req, res, user, 200);
});
