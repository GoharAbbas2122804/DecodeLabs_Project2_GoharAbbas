export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: any[];

  constructor(
    statusCode: number,
    message: string,
    code = 'BAD_REQUEST',
    details?: any[],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any[]) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication credentials are required or invalid') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new ApiError(409, message, 'CONFLICT');
  }

  static tooManyRequests(message = 'Rate limit exceeded, please try again later') {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message, 'INTERNAL_SERVER_ERROR', undefined, false);
  }
}
