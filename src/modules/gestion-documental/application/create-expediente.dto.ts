import { z } from 'zod';

export const CreateExpedienteSchema = z.object({
    code: z.string().min(1, { message: 'El código es obligatorio.' }),
    subject: z.string().min(1, { message: 'El asunto es obligatorio.' }),
});

export type CreateExpedienteDto = z.infer<typeof CreateExpedienteSchema>;
