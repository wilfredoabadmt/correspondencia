import { z } from 'zod';
import { roleEnum } from '~/db/schema';

export const AssignRoleSchema = z.object({
    role: z.enum(roleEnum.enumValues, {
        errorMap: () => ({ message: 'Invalid role provided.' }),
    }),
});

export type AssignRoleDto = z.infer<typeof AssignRoleSchema>;