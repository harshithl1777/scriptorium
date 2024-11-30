import { z } from 'zod';

export const UsersValidationSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string().min(10).optional(),
    avatarURL: z.string().url().optional(),
});

export const UsersUpdateValidationSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phoneNumber: z.string().min(10).optional(),
    avatarURL: z.string().url().optional(),
});

export const SessionsValidationSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const TemplatesValidationSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    code: z.string().optional(),
    language: z.enum(['C', 'C++', 'Java', 'Python', 'JavaScript', 'Ruby', 'Go', 'PHP', 'Swift', 'Rust']).optional(),
});

export const RunnersValidationSchema = z.object({
    code: z.string().min(1),
    language: z.enum(['C', 'C++', 'Java', 'Python', 'JavaScript', 'Ruby', 'Go', 'PHP', 'Swift', 'Rust']).optional(),
    stdin: z.string().optional(),
});

export const PostsValidationSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    content: z.string().optional(),
});

export const CommentsValidationSchema = z.object({
    content: z.string().min(1).max(1000),
    blogPostId: z.number(),
    parentId: z.number().nullable(),
});

export const ReportsValidationSchema = z.object({
    reason: z.string().min(1),
    blogPostId: z.number().optional(),
    commentId: z.number().optional(),
});

export const RatingsValidationSchema = z.object({
    action: z.enum(['upvote', 'downvote']),
});
