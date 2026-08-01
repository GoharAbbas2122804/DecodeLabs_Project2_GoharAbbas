import { prisma } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthPayload, PostStatus, Role } from '../types';

export interface CreatePostInput {
  title: string;
  content: string;
  status?: PostStatus;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  status?: PostStatus;
}

export class PostService {
  static async getPosts(
    page = 1,
    limit = 10,
    mine = false,
    statusFilter?: PostStatus,
    requestingUser?: AuthPayload
  ) {
    const skip = (page - 1) * limit;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (mine && requestingUser) {
      where.userId = requestingUser.userId;
      if (statusFilter) {
        where.status = statusFilter;
      }
    } else if (requestingUser && requestingUser.role === Role.ADMIN) {
      if (statusFilter) {
        where.status = statusFilter;
      }
    } else {
      // Anonymous or non-admin querying general feed sees strictly PUBLISHED posts
      where.status = PostStatus.PUBLISHED;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
      prisma.post.count({ where }),
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

  static async createPost(input: CreatePostInput, author: AuthPayload) {
    const post = await prisma.post.create({
      data: {
        userId: author.userId,
        title: input.title,
        content: input.content,
        status: input.status || PostStatus.DRAFT,
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

  static async getPostById(postId: string, requestingUser?: AuthPayload) {
    const post = await prisma.post.findUnique({
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
      throw ApiError.notFound('Post not found');
    }

    // Semantic Check: DRAFT Visibility Restriction
    if (post.status === PostStatus.DRAFT) {
      if (
        !requestingUser ||
        (requestingUser.userId !== post.userId && requestingUser.role !== Role.ADMIN)
      ) {
        throw ApiError.forbidden('Access denied to draft post');
      }
    }

    return {
      ...post,
      commentsCount: post._count.comments,
    };
  }

  static async updatePost(
    postId: string,
    input: UpdatePostInput,
    requestingUser: AuthPayload
  ) {
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw ApiError.notFound('Post not found');
    }

    // Semantic Check: Ownership / Authorization
    if (existingPost.userId !== requestingUser.userId && requestingUser.role !== Role.ADMIN) {
      throw ApiError.forbidden('You are only authorized to modify your own posts');
    }

    const updatedPost = await prisma.post.update({
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

  static async deletePost(postId: string, requestingUser: AuthPayload) {
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw ApiError.notFound('Post not found');
    }

    // Semantic Check: Ownership / Authorization
    if (existingPost.userId !== requestingUser.userId && requestingUser.role !== Role.ADMIN) {
      throw ApiError.forbidden('You are only authorized to delete your own posts');
    }

    await prisma.post.delete({
      where: { id: postId },
    });
  }

  static async getPostsByUserId(
    targetUserId: string,
    page = 1,
    limit = 10,
    requestingUser?: AuthPayload
  ) {
    const skip = (page - 1) * limit;

    const isOwnerOrAdmin =
      requestingUser &&
      (requestingUser.userId === targetUserId || requestingUser.role === Role.ADMIN);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId: targetUserId };
    if (!isOwnerOrAdmin) {
      where.status = PostStatus.PUBLISHED;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
      prisma.post.count({ where }),
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
