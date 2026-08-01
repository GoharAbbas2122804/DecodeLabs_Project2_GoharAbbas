import { z } from 'zod';
import { PostStatus, Role } from '../types';

// Generic UUID Parameter Schema
export const uuidParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID parameter format' }),
});

export const postCommentParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Post UUID format' }),
});

// Pagination & Query Schemas
export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  mine: z.string().optional().transform((val) => val === 'true'),
  status: z.nativeEnum(PostStatus).optional(),
});

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url({ message: 'Avatar URL must be a valid URL' }).optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// User Update Schema
export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  role: z.nativeEnum(Role).optional(),
});

// Post Schemas
export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(200, { message: 'Title cannot exceed 200 characters' }),
  content: z
    .string()
    .min(10, { message: 'Content must be at least 10 characters long' })
    .max(50000, { message: 'Content cannot exceed 50,000 characters' }),
  status: z.nativeEnum(PostStatus).optional().default(PostStatus.DRAFT),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(200, { message: 'Title cannot exceed 200 characters' })
    .optional(),
  content: z
    .string()
    .min(10, { message: 'Content must be at least 10 characters long' })
    .max(50000, { message: 'Content cannot exceed 50,000 characters' })
    .optional(),
  status: z.nativeEnum(PostStatus).optional(),
});

// Comment Schema
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Comment content cannot be empty' })
    .max(1000, { message: 'Comment content cannot exceed 1000 characters' }),
});
