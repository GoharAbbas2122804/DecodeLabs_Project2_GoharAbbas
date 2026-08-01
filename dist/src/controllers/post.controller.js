"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsByUserIdHandler = exports.deletePostHandler = exports.updatePostHandler = exports.getPostByIdHandler = exports.createPostHandler = exports.getPostsHandler = void 0;
const post_service_1 = require("../services/post.service");
const responseFormatter_1 = require("../utils/responseFormatter");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getPostsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const mine = req.query.mine === 'true';
    const statusFilter = req.query.status;
    const { posts, meta } = await post_service_1.PostService.getPosts(page, limit, mine, statusFilter, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, posts, 200, meta);
});
exports.createPostHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const post = await post_service_1.PostService.createPost(req.body, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, post, 201);
});
exports.getPostByIdHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const postId = req.params.id;
    const post = await post_service_1.PostService.getPostById(postId, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, post, 200);
});
exports.updatePostHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const postId = req.params.id;
    const updatedPost = await post_service_1.PostService.updatePost(postId, req.body, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, updatedPost, 200);
});
exports.deletePostHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const postId = req.params.id;
    await post_service_1.PostService.deletePost(postId, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, null, 204);
});
exports.getPostsByUserIdHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.params.id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const { posts, meta } = await post_service_1.PostService.getPostsByUserId(userId, page, limit, req.user);
    return (0, responseFormatter_1.sendSuccess)(req, res, posts, 200, meta);
});
