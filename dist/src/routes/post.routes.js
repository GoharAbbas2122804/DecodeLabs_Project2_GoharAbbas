"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controller_1 = require("../controllers/post.controller");
const comment_controller_1 = require("../controllers/comment.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, (0, validate_1.validate)({ query: schemas_1.paginationQuerySchema }), post_controller_1.getPostsHandler);
router.post('/', auth_1.requireAuth, (0, validate_1.validate)({ body: schemas_1.createPostSchema }), post_controller_1.createPostHandler);
router.get('/:id', auth_1.optionalAuth, (0, validate_1.validate)({ params: schemas_1.uuidParamSchema }), post_controller_1.getPostByIdHandler);
router.put('/:id', auth_1.requireAuth, (0, validate_1.validate)({ params: schemas_1.uuidParamSchema, body: schemas_1.updatePostSchema }), post_controller_1.updatePostHandler);
router.delete('/:id', auth_1.requireAuth, (0, validate_1.validate)({ params: schemas_1.uuidParamSchema }), post_controller_1.deletePostHandler);
// Nested Comments Endpoints under Posts
router.get('/:id/comments', (0, validate_1.validate)({ params: schemas_1.uuidParamSchema, query: schemas_1.paginationQuerySchema }), comment_controller_1.getCommentsForPostHandler);
router.post('/:id/comments', auth_1.requireAuth, (0, validate_1.validate)({ params: schemas_1.uuidParamSchema, body: schemas_1.createCommentSchema }), comment_controller_1.createCommentHandler);
exports.default = router;
