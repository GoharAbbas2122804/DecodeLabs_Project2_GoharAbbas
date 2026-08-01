"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const apiError_1 = require("../utils/apiError");
const types_1 = require("../types");
class AuthService {
    static async register(input) {
        // Semantic Check: Email Uniqueness
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (existingUser) {
            throw apiError_1.ApiError.conflict('Email address is already registered');
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        const user = await db_1.prisma.user.create({
            data: {
                email: input.email.toLowerCase(),
                passwordHash,
                role: types_1.Role.USER,
                profile: {
                    create: {
                        firstName: input.firstName,
                        lastName: input.lastName,
                        bio: input.bio,
                        avatarUrl: input.avatarUrl,
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
        // Generate token for automatic login upon registration
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        return { token, user };
    }
    static async login(input) {
        const user = await db_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
            include: { profile: true },
        });
        // Semantic Check: Password correctness & User existence
        if (!user) {
            throw apiError_1.ApiError.unauthorized('Invalid email or password');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
            throw apiError_1.ApiError.unauthorized('Invalid email or password');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        // Omit passwordHash from return payload
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            token,
            user: userWithoutPassword,
        };
    }
    static async getMe(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
            },
        });
        if (!user) {
            throw apiError_1.ApiError.notFound('User profile not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
