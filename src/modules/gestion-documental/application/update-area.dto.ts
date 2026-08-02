import { z } from 'zod';

export const UpdateAreaSchema = z
    .object({
        name: z.string().min(1, { message: 'Name is required.' }).optional(),
        code: z
            .string()
            .min(1, { message: 'Code is required.' })
            .max(50, { message: 'Code cannot be longer than 50 characters.' })
            .optional(),
    })
    .refine((data) => data.name || data.code, {
        message: 'At least one field (name or code) must be provided for an update.',
    });

export type UpdateAreaDto = z.infer<typeof UpdateAreaSchema>;