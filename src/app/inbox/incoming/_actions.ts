'use server';

import 'reflect-metadata';
import { revalidatePath } from 'next/cache';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ReceiveDocumentUseCase } from '~/modules/gestion-documental/application/receive-document.use-case';
import type { RejectDocumentUseCase } from '~/modules/gestion-documental/application/reject-document.use-case';

export async function receiveDocumentAction({ documentId }: { documentId: string }) {
    const session = await auth();
    if (!session?.user?.organizationId || !session.user.id) {
        return { success: false, error: 'No autorizado.' };
    }

    try {
        const useCase = container.resolve<ReceiveDocumentUseCase>(
            InjectionTokens.ReceiveDocumentUseCase
        );

        await useCase.execute({
            documentId,
            userId: session.user.id,
            organizationId: session.user.organizationId,
        });

        revalidatePath('/inbox/incoming');
        revalidatePath('/inbox/pending');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error al recepcionar el documento.' };
    }
}

export async function rejectDocumentAction({ documentId, reason }: { documentId: string; reason: string }) {
    const session = await auth();
    if (!session?.user?.organizationId || !session.user.id) {
        return { success: false, error: 'No autorizado.' };
    }

    try {
        const useCase = container.resolve<RejectDocumentUseCase>(
            InjectionTokens.RejectDocumentUseCase
        );

        await useCase.execute({
            documentId,
            userId: session.user.id,
            reason,
            organizationId: session.user.organizationId,
        });

        revalidatePath('/inbox/incoming');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error al rechazar el documento.' };
    }
}
