"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const db_1 = require("../config/db");
const apiError_1 = require("../utils/apiError");
const types_1 = require("../types");
class CommentService {
    static async getCommentsForPost(postId, page = 1, limit = 10) {
        const post = await db_1.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw apiError_1.ApiError.notFound('Post not found');
        }
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            db_1.prisma.comment.findMany({
                where: { postId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            profile: true,
                        },
                    },
                },
            }),
            db_1.prisma.comment.count({ where: { postId } }),
        ]);
        const formattedComments = comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            postId: comment.postId,
            author: comment.user,
        }));
        return {
            comments: formattedComments,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async createComment(postId, input, author) {
        const post = await db_1.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            throw apiError_1.ApiError.notFound('Target post not found');
        }
        // Semantic Check: Block commenting on DRAFT posts
        if (post.status !== types_1.PostStatus.PUBLISHED) {
            throw apiError_1.ApiError.badRequest('Comment blocking: Cannot submit comments on DRAFT posts. Post must be PUBLISHED.');
        }
        const comment = await db_1.prisma.comment.create({
            data: {
                postId,
                userId: author.userId,
                content: input.content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
        return comment;
    }
    static async deleteComment(commentId, requestingUser) {
        const existingComment = await db_1.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!existingComment) {
            throw apiError_1.ApiError.notFound('Comment not found');
        }
        // Semantic Check: Ownership / Authorization
        if (existingComment.userId !== requestingUser.userId && requestingUser.role !== types_1.Role.ADMIN) {
            throw apiError_1.ApiError.forbidden('You are only authorized to delete your own comments');
        }
        await db_1.prisma.comment.delete({
            where: { id: commentId },
        });
    }
}
exports.CommentService = CommentService;
