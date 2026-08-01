"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckHandler = void 0;
const responseFormatter_1 = require("../utils/responseFormatter");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.healthCheckHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const healthData = {
        status: 'stable',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
    };
    return (0, responseFormatter_1.sendSuccess)(req, res, healthData, 200);
});
