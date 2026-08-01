"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = exports.updatePostSchema = exports.createPostSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = exports.paginationQuerySchema = exports.postCommentParamsSchema = exports.uuidParamSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
// Generic UUID Parameter Schema
exports.uuidParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid UUID parameter format' }),
});
exports.postCommentParamsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: 'Invalid Post UUID format' }),
});
// Pagination & Query Schemas
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    mine: zod_1.z.string().optional().transform((val) => val === 'true'),
    status: zod_1.z.nativeEnum(types_1.PostStatus).optional(),
});
// Auth Schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Invalid email address format' }),
    password: zod_1.z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    firstName: zod_1.z.string().min(2, { message: 'First name must be at least 2 characters' }),
    lastName: zod_1.z.string().min(2, { message: 'Last name must be at least 2 characters' }),
    bio: zod_1.z.string().max(500).optional(),
    avatarUrl: zod_1.z.string().url({ message: 'Avatar URL must be a valid URL' }).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Invalid email address format' }),
    password: zod_1.z.string().min(1, { message: 'Password is required' }),
});
// User Update Schema
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    bio: zod_1.z.string().max(500).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    role: zod_1.z.nativeEnum(types_1.Role).optional(),
});
// Post Schemas
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, { message: 'Title must be at least 3 characters long' })
        .max(200, { message: 'Title cannot exceed 200 characters' }),
    content: zod_1.z
        .string()
        .min(10, { message: 'Content must be at least 10 characters long' })
        .max(50000, { message: 'Content cannot exceed 50,000 characters' }),
    status: zod_1.z.nativeEnum(types_1.PostStatus).optional().default(types_1.PostStatus.DRAFT),
});
exports.updatePostSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, { message: 'Title must be at least 3 characters long' })
        .max(200, { message: 'Title cannot exceed 200 characters' })
        .optional(),
    content: zod_1.z
        .string()
        .min(10, { message: 'Content must be at least 10 characters long' })
        .max(50000, { message: 'Content cannot exceed 50,000 characters' })
        .optional(),
    status: zod_1.z.nativeEnum(types_1.PostStatus).optional(),
});
// Comment Schema
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(1, { message: 'Comment content cannot be empty' })
        .max(1000, { message: 'Comment content cannot exceed 1000 characters' }),
});
