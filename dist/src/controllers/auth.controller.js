"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meHandler = exports.loginHandler = exports.registerHandler = void 0;
const auth_service_1 = require("../services/auth.service");
const responseFormatter_1 = require("../utils/responseFormatter");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.registerHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.AuthService.register(req.body);
    return (0, responseFormatter_1.sendSuccess)(req, res, result, 201);
});
exports.loginHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.AuthService.login(req.body);
    return (0, responseFormatter_1.sendSuccess)(req, res, result, 200);
});
exports.meHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await auth_service_1.AuthService.getMe(req.user.userId);
    return (0, responseFormatter_1.sendSuccess)(req, res, user, 200);
});
