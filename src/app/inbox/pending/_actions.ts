'use server';

import 'reflect-metadata';
import { revalidatePath } from 'next/cache';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { JustifyDelayUseCase } from '~/modules/gestion-documental/application/justify-delay.use-case';
import type { GroupDocumentsUseCase } from '~/modules/gestion-documental/application/group-documents.use-case';
import type { ArchiveDocumentUseCase } from '~/modules/gestion-documental/application/archive-document.use-case';

export async function justifyDelayAction({ documentId, reason }: { documentId: string; reason: string }) {
    const session = await auth();
    if (!session?.user?.organizationId || !session.user.id) {
        return { success: false, error: 'No autorizado.' };
    }

    try {
        const useCase = container.resolve<JustifyDelayUseCase>(
            InjectionTokens.JustifyDelayUseCase
        );

        await useCase.execute({
            documentId,
            userId: session.user.id,
            reason,
            organizationId: session.user.organizationId,
        });

        revalidatePath('/inbox/pending');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error al guardar la justificación.' };
    }
}

export async function groupDocumentsAction({ mainDocumentId, secondaryDocumentIds }: { mainDocumentId: string; secondaryDocumentIds: string[] }) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, error: 'No autorizado.' };
    }

    try {
        const useCase = container.resolve<GroupDocumentsUseCase>(
            InjectionTokens.GroupDocumentsUseCase
        );

        await useCase.execute({
            mainDocumentId,
            secondaryDocumentIds,
            organizationId: session.user.organizationId,
        });

        revalidatePath('/inbox/pending');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error al agrupar documentos.' };
    }
}

export async function archiveDocumentAction({ documentId, folderCategory, observations }: { documentId: string; folderCategory: string; observations?: string }) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, error: 'No autorizado.' };
    }

    try {
        const useCase = container.resolve<ArchiveDocumentUseCase>(
            InjectionTokens.ArchiveDocumentUseCase
        );

        await useCase.execute({
            documentId,
            folderCategory,
            observations: observations || null,
            organizationId: session.user.organizationId,
        });

        revalidatePath('/inbox/pending');
        revalidatePath('/inbox/archived');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error al archivar el documento.' };
    }
}
