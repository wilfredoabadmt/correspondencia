import { z } from 'zod';

export const CreateAreaSchema = z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    code: z
        .string()
        .min(1, { message: 'Code is required.' })
        .max(50, { message: 'Code cannot be longer than 50 characters.' }),
});

export type CreateAreaDto = z.infer<typeof CreateAreaSchema>;