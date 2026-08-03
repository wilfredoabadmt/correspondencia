'use server';

import 'reflect-metadata';
import { revalidatePath } from 'next/cache';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { UnarchiveDocumentUseCase } from '~/modules/gestion-documental/application/unarchive-document.use-case';

export async function unarchiveDocumentAction({ documentId }: { documentId: string }) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, error: 'No autorizado.' };
    }

    try {
        const useCase = container.resolve<UnarchiveDocumentUseCase>(
            InjectionTokens.UnarchiveDocumentUseCase
        );

        await useCase.execute({
            documentId,
            organizationId: session.user.organizationId,
        });

        revalidatePath('/inbox/archived');
        revalidatePath('/inbox/pending');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error al quitar de archivo.' };
    }
}
