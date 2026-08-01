import { AuthPayload } from './index';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthPayload;
    requestId?: string;
  }
}

declare module 'express' {
  interface Request {
    user?: AuthPayload;
    requestId?: string;
  }
}
