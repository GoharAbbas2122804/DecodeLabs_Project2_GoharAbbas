"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred on the server';
    let details = undefined;
    // 1. Zod Validation Error (Syntactic Failure)
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Syntactic validation failure: invalid request payload';
        details = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
        }));
    }
    // 2. Custom ApiError (Operational Failure)
    else if (err instanceof apiError_1.ApiError) {
        statusCode = err.statusCode;
        errorCode = err.code;
        message = err.message;
        details = err.details;
    }
    // 3. JSON Syntax Error
    else if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        statusCode = 400;
        errorCode = 'MALFORMED_JSON';
        message = 'Malformed JSON neurotransmitter payload';
    }
    // 4. Prisma Known Request Error or other unhandled errors
    else {
        logger_1.logger.error(`[Unhandled Error] [${req.requestId}] ${err.stack || err.message}`);
        if (env_1.env.NODE_ENV === 'development') {
            message = err.message;
        }
    }
    return res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            ...(details && { details }),
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId: req.requestId || 'unknown-request-id',
        },
    });
};
exports.errorHandler = errorHandler;
