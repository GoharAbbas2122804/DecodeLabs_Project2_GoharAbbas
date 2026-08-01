import { prisma } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthPayload, PostStatus, Role } from '../types';

export interface CreateCommentInput {
  content: string;
}

export class CommentService {
  static async getCommentsForPost(postId: string, page = 1, limit = 10) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
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
      prisma.comment.count({ where: { postId } }),
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

  static async createComment(
    postId: string,
    input: CreateCommentInput,
    author: AuthPayload
  ) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw ApiError.notFound('Target post not found');
    }

    // Semantic Check: Block commenting on DRAFT posts
    if (post.status !== PostStatus.PUBLISHED) {
      throw ApiError.badRequest(
        'Comment blocking: Cannot submit comments on DRAFT posts. Post must be PUBLISHED.'
      );
    }

    const comment = await prisma.comment.create({
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

  static async deleteComment(commentId: string, requestingUser: AuthPayload) {
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      throw ApiError.notFound('Comment not found');
    }

    // Semantic Check: Ownership / Authorization
    if (existingComment.userId !== requestingUser.userId && requestingUser.role !== Role.ADMIN) {
      throw ApiError.forbidden('You are only authorized to delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
