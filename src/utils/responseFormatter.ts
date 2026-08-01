import { Request, Response } from 'express';
import { ApiSuccessResponse } from '../types';

export const sendSuccess = <T>(
  req: Request,
  res: Response,
  data: T,
  statusCode = 200,
  paginationMeta?: { page?: number; limit?: number; total?: number; totalPages?: number }
): Response => {
  if (statusCode === 204) {
    return res.status(204).send();
  }

  const responseBody: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown-request-id',
      ...paginationMeta,
    },
  };

  return res.status(statusCode).json(responseBody);
};
