import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type LoginPayload = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['STUDENT', 'INSTRUCTOR']),
});
export type RegisterPayload = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').optional(),
  avatarUrl: z
    .union([z.string().url('Enter a valid URL'), z.literal('')])
    .optional(),
});
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
