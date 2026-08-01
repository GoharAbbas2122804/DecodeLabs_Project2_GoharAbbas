"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const db_1 = require("../config/db");
class AdminService {
    static async getStats() {
        const [userCount, postCount, commentCount] = await Promise.all([
            db_1.prisma.user.count(),
            db_1.prisma.post.count(),
            db_1.prisma.comment.count(),
        ]);
        return {
            usersCount: userCount,
            postsCount: postCount,
            commentsCount: commentCount,
        };
    }
}
exports.AdminService = AdminService;
