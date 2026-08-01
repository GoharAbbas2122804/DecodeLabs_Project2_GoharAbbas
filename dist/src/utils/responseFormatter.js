"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = (req, res, data, statusCode = 200, paginationMeta) => {
    if (statusCode === 204) {
        return res.status(204).send();
    }
    const responseBody = {
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
exports.sendSuccess = sendSuccess;
