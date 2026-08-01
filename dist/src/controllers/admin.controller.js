"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStatsHandler = void 0;
const admin_service_1 = require("../services/admin.service");
const responseFormatter_1 = require("../utils/responseFormatter");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getAdminStatsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await admin_service_1.AdminService.getStats();
    return (0, responseFormatter_1.sendSuccess)(req, res, stats, 200);
});
