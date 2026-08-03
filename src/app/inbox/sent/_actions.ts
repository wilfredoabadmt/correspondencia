'use server';

import 'reflect-metadata';
import { revalidatePath } from 'next/cache';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { CancelDerivationUseCase } from '~/modules/gestion-documental/application/cancel-derivation.use-case';

export async function cancelDerivationAction({ documentId }: { documentId: string }) {
    const session = await auth();
    if (!session?.user?.organizationId || !session.user.id) {
        return { success: false, error: 'No autorizado.' };
    }

    try {
        const useCase = container.resolve<CancelDerivationUseCase>(
            InjectionTokens.CancelDerivationUseCase
        );

        await useCase.execute({
            documentId,
            userId: session.user.id,
            organizationId: session.user.organizationId,
        });

        revalidatePath('/inbox/sent');
        revalidatePath('/inbox/pending');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Error al cancelar la derivación.' };
    }
}
