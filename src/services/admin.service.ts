import { prisma } from '../config/db';

export class AdminService {
  static async getStats() {
    const [userCount, postCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
    ]);

    return {
      usersCount: userCount,
      postsCount: postCount,
      commentsCount: commentCount,
    };
  }
}
