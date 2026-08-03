import { z } from 'zod';

export const UpdateExpedienteSchema = z.object({
    subject: z.string().min(1).optional(),
    status: z.enum(['Abierto', 'Cerrado', 'Archivado']).optional(),
});

export type UpdateExpedienteDto = z.infer<typeof UpdateExpedienteSchema>;

export const AssociateDocumentSchema = z.object({
    expedienteId: z.string().min(1, { message: 'El ID del expediente es obligatorio.' }),
});

export type AssociateDocumentDto = z.infer<typeof AssociateDocumentSchema>;
