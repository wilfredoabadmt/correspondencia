'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '~/modules/auth/lib/auth';
import { container, InjectionTokens } from '~/core/container';
import { DeriveDocumentUseCase } from '~/modules/gestion-documental/application/derive-document.use-case';
import { AppError } from '@/core/errors/app.error';

const DeriveDocumentSchema = z.object({
    documentId: z.string().min(1, 'El ID del documento es requerido.'),
    toAreaId: z.string().min(1, 'Debe seleccionar un área de destino.'),
    comment: z.string().optional(),
});

export type DeriveFormState = {
    message: string;
    errors?: {
        toAreaId?: string[];
        comment?: string[];
        _form?: string[];
    };
    success: boolean;
};

export async function deriveDocument(
    prevState: DeriveFormState,
    formData: FormData
): Promise<DeriveFormState> {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        return {
            message: 'Error de autenticación.',
            success: false,
        };
    }

    const validatedFields = DeriveDocumentSchema.safeParse({
        documentId: formData.get('documentId'),
        toAreaId: formData.get('toAreaId'),
        comment: formData.get('comment'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Error de validación.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { documentId, toAreaId, comment } = validatedFields.data;

    try {
        const deriveDocumentUseCase = container.resolve<DeriveDocumentUseCase>(
            InjectionTokens.DeriveDocumentUseCase
        );

        await deriveDocumentUseCase.execute({
            documentId,
            newAreaId: toAreaId,
            comment: comment || null,
            userId: session.user.id,
            organizationId: session.user.organizationId,
        });
    } catch (error) {
        if (error instanceof AppError) {
            return { message: error.message, success: false };
        }
        console.error('DeriveDocumentActionError:', error);
        return { message: 'Ocurrió un error inesperado al derivar el documento.', success: false };
    }

    revalidatePath(`/documents/${documentId}`);
    return { message: 'Documento derivado exitosamente.', success: true };
}