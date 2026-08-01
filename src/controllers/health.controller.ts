import { Request, Response } from 'express';
import { sendSuccess } from '../utils/responseFormatter';
import { asyncHandler } from '../utils/asyncHandler';

export const healthCheckHandler = asyncHandler(async (req: Request, res: Response) => {
  const healthData = {
    status: 'stable',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  };

  return sendSuccess(req, res, healthData, 200);
});
