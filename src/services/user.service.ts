import { prisma } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthPayload, PostStatus, Role } from '../types';

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  role?: Role;
}

export class UserService {
  static async getUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
                where: { status: PostStatus.PUBLISHED },
              },
            },
          },
        },
      }),
      prisma.user.count(),
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

  static async getUserById(targetUserId: string, requestingUser?: AuthPayload) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        posts: {
          where:
            requestingUser &&
            (requestingUser.userId === targetUserId || requestingUser.role === Role.ADMIN)
              ? {}
              : { status: PostStatus.PUBLISHED },
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
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  static async updateUser(
    targetUserId: string,
    input: UpdateUserInput,
    requestingUser: AuthPayload
  ) {
    // Semantic Check: Ownership / Authorization
    if (requestingUser.userId !== targetUserId && requestingUser.role !== Role.ADMIN) {
      throw ApiError.forbidden('You are only authorized to update your own user profile');
    }

    // Role modification is strictly ADMIN only
    if (input.role && requestingUser.role !== Role.ADMIN) {
      throw ApiError.forbidden('Only administrators can modify user roles');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });

    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    const updatedUser = await prisma.user.update({
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

  static async deleteUser(targetUserId: string, requestingUser: AuthPayload) {
    // Semantic Check: Ownership / Authorization
    if (requestingUser.userId !== targetUserId && requestingUser.role !== Role.ADMIN) {
      throw ApiError.forbidden('You are only authorized to delete your own user profile');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });
  }
}
