import { z } from 'zod';

export const PresignedUrlSchema = z.object({
    fileName: z.string().min(1, { message: 'fileName is required.' }),
    contentType: z.string().min(1, { message: 'contentType is required.' }),
});

export type PresignedUrlDto = z.infer<typeof PresignedUrlSchema>;