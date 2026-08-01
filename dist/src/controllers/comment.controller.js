"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommentHandler = exports.createCommentHandler = exports.getCommentsForPostHandler = void 0;
const comment_service_1 = require("../services/comment.service");
const responseFormatter_1 = require("../utils/responseFormatter");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getCommentsForPostHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const postId = req.params.id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const { comments, meta } = await comment_service_1.CommentService.getCommentsForPost(postId, page, limit);
    return (0, responseFormatter_1.sendSuccess)(req, res, comments, 200, meta);
});
exports.createCommentHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const postId = req.params.id;
    const comment = await comment_service_1.CommentService.createComment(postId, req.body, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, comment, 201);
});
exports.deleteCommentHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const commentId = req.params.id;
    await comment_service_1.CommentService.deleteComment(commentId, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, null, 204);
});
