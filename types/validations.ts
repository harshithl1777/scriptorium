import { z } from 'zod';

export const POSTUsersValidationSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string().min(10).optional(),
    avatarURL: z.string().url().optional(),
});
