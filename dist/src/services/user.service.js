"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("../config/db");
const apiError_1 = require("../utils/apiError");
const types_1 = require("../types");
class UserService {
    static async getUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            db_1.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    profile: true,
                    _count: {
                        select: {
                            posts: {
                                where: { status: types_1.PostStatus.PUBLISHED },
                            },
                        },
                    },
                },
            }),
            db_1.prisma.user.count(),
        ]);
        const formattedUsers = users.map((user) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            profile: user.profile,
            publishedPostsCount: user._count.posts,
        }));
        return {
            users: formattedUsers,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async getUserById(targetUserId, requestingUser) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: true,
                posts: {
                    where: requestingUser &&
                        (requestingUser.userId === targetUserId || requestingUser.role === types_1.Role.ADMIN)
                        ? {}
                        : { status: types_1.PostStatus.PUBLISHED },
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
        if (!user) {
            throw apiError_1.ApiError.notFound('User not found');
        }
        return user;
    }
    static async updateUser(targetUserId, input, requestingUser) {
        // Semantic Check: Ownership / Authorization
        if (requestingUser.userId !== targetUserId && requestingUser.role !== types_1.Role.ADMIN) {
            throw apiError_1.ApiError.forbidden('You are only authorized to update your own user profile');
        }
        // Role modification is strictly ADMIN only
        if (input.role && requestingUser.role !== types_1.Role.ADMIN) {
            throw apiError_1.ApiError.forbidden('Only administrators can modify user roles');
        }
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id: targetUserId },
            include: { profile: true },
        });
        if (!existingUser) {
            throw apiError_1.ApiError.notFound('User not found');
        }
        const updatedUser = await db_1.prisma.user.update({
            where: { id: targetUserId },
            data: {
                ...(input.role && { role: input.role }),
                profile: {
                    update: {
                        ...(input.firstName && { firstName: input.firstName }),
                        ...(input.lastName && { lastName: input.lastName }),
                        ...(input.bio !== undefined && { bio: input.bio }),
                        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
                    },
                },
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
            },
        });
        return updatedUser;
    }
    static async deleteUser(targetUserId, requestingUser) {
        // Semantic Check: Ownership / Authorization
        if (requestingUser.userId !== targetUserId && requestingUser.role !== types_1.Role.ADMIN) {
            throw apiError_1.ApiError.forbidden('You are only authorized to delete your own user profile');
        }
        const existingUser = await db_1.prisma.user.findUnique({
            where: { id: targetUserId },
        });
        if (!existingUser) {
            throw apiError_1.ApiError.notFound('User not found');
        }
        await db_1.prisma.user.delete({
            where: { id: targetUserId },
        });
    }
}
exports.UserService = UserService;
