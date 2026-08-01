import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { sendSuccess } from '../utils/responseFormatter';
import { asyncHandler } from '../utils/asyncHandler';

export const getAdminStatsHandler = asyncHandler(async (req: Request, res: Response) => {
  const stats = await AdminService.getStats();
  return sendSuccess(req, res, stats, 200);
});
