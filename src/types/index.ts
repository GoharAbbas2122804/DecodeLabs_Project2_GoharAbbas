import { Role } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
