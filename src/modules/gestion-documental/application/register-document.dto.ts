import { z } from 'zod';
import { DocumentType } from '../core/document.entity';

// Get the values from the DocumentType enum to use in Zod
const documentTypeValues = Object.values(DocumentType) as [string, ...string[]];

export const RegisterDocumentSchema = z.object({
    documentType: z.enum(documentTypeValues),
    areaHierarchyId: z.string().uuid({ message: 'Invalid Area Hierarchy ID.' }),
    subject: z.string().min(1, { message: 'Subject is required.' }),
    sender: z.string().min(1, { message: 'Sender is required.' }),
    receptionDate: z.coerce.date({ message: 'Invalid reception date.' }),
    documentNumber: z.string().optional(),
    attachmentStorageKey: z.string().optional(),
});

// This type can be inferred from the schema and used in the UI layer
export type RegisterDocumentDto = z.infer<typeof RegisterDocumentSchema>;