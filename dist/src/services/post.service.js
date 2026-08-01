"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const db_1 = require("../config/db");
const apiError_1 = require("../utils/apiError");
const types_1 = require("../types");
class PostService {
    static async getPosts(page = 1, limit = 10, mine = false, statusFilter, requestingUser) {
        const skip = (page - 1) * limit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where = {};
        if (mine && requestingUser) {
            where.userId = requestingUser.userId;
            if (statusFilter) {
                where.status = statusFilter;
            }
        }
        else if (requestingUser && requestingUser.role === types_1.Role.ADMIN) {
            if (statusFilter) {
                where.status = statusFilter;
            }
        }
        else {
            // Anonymous or non-admin querying general feed sees strictly PUBLISHED posts
            where.status = types_1.PostStatus.PUBLISHED;
        }
        const [posts, total] = await Promise.all([
            db_1.prisma.post.findMany({
                where,
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
                    _count: {
                        select: { comments: true },
                    },
                },
            }),
            db_1.prisma.post.count({ where }),
        ]);
        const formattedPosts = posts.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            status: post.status,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.user,
            commentsCount: post._count.comments,
        }));
        return {
            posts: formattedPosts,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async createPost(input, author) {
        const post = await db_1.prisma.post.create({
            data: {
                userId: author.userId,
                title: input.title,
                content: input.content,
                status: input.status || types_1.PostStatus.DRAFT,
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
        return post;
    }
    static async getPostById(postId, requestingUser) {
        const post = await db_1.prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
                _count: {
                    select: { comments: true },
                },
            },
        });
        if (!post) {
            throw apiError_1.ApiError.notFound('Post not found');
        }
        // Semantic Check: DRAFT Visibility Restriction
        if (post.status === types_1.PostStatus.DRAFT) {
            if (!requestingUser ||
                (requestingUser.userId !== post.userId && requestingUser.role !== types_1.Role.ADMIN)) {
                throw apiError_1.ApiError.forbidden('Access denied to draft post');
            }
        }
        return {
            ...post,
            commentsCount: post._count.comments,
        };
    }
    static async updatePost(postId, input, requestingUser) {
        const existingPost = await db_1.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!existingPost) {
            throw apiError_1.ApiError.notFound('Post not found');
        }
        // Semantic Check: Ownership / Authorization
        if (existingPost.userId !== requestingUser.userId && requestingUser.role !== types_1.Role.ADMIN) {
            throw apiError_1.ApiError.forbidden('You are only authorized to modify your own posts');
        }
        const updatedPost = await db_1.prisma.post.update({
            where: { id: postId },
            data: {
                ...(input.title && { title: input.title }),
                ...(input.content && { content: input.content }),
                ...(input.status && { status: input.status }),
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
        return updatedPost;
    }
    static async deletePost(postId, requestingUser) {
        const existingPost = await db_1.prisma.post.findUnique({
            where: { id: postId },
        });
        if (!existingPost) {
            throw apiError_1.ApiError.notFound('Post not found');
        }
        // Semantic Check: Ownership / Authorization
        if (existingPost.userId !== requestingUser.userId && requestingUser.role !== types_1.Role.ADMIN) {
            throw apiError_1.ApiError.forbidden('You are only authorized to delete your own posts');
        }
        await db_1.prisma.post.delete({
            where: { id: postId },
        });
    }
    static async getPostsByUserId(targetUserId, page = 1, limit = 10, requestingUser) {
        const skip = (page - 1) * limit;
        const isOwnerOrAdmin = requestingUser &&
            (requestingUser.userId === targetUserId || requestingUser.role === types_1.Role.ADMIN);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where = { userId: targetUserId };
        if (!isOwnerOrAdmin) {
            where.status = types_1.PostStatus.PUBLISHED;
        }
        const [posts, total] = await Promise.all([
            db_1.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { comments: true },
                    },
                },
            }),
            db_1.prisma.post.count({ where }),
        ]);
        return {
            posts,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
exports.PostService = PostService;
