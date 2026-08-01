"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserHandler = exports.updateUserHandler = exports.getUserByIdHandler = exports.getUsersHandler = void 0;
const user_service_1 = require("../services/user.service");
const responseFormatter_1 = require("../utils/responseFormatter");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getUsersHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const { users, meta } = await user_service_1.UserService.getUsers(page, limit);
    return (0, responseFormatter_1.sendSuccess)(req, res, users, 200, meta);
});
exports.getUserByIdHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.params.id;
    const user = await user_service_1.UserService.getUserById(userId, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, user, 200);
});
exports.updateUserHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.params.id;
    const updatedUser = await user_service_1.UserService.updateUser(userId, req.body, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, updatedUser, 200);
});
exports.deleteUserHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.params.id;
    await user_service_1.UserService.deleteUser(userId, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, null, 204);
});
