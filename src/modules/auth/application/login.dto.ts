import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email({ message: 'Invalid email format.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
    // organizationId will be handled differently, maybe from subdomain or a separate field.
    // For now, the API will assume a mock one.
});

export type LoginDto = z.infer<typeof LoginSchema>;