'use server';

import 'reflect-metadata';
import { revalidatePath } from 'next/cache';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ChangePasswordUseCase } from '~/modules/users/application/change-password.use-case';
import type { ManageFavoritesUseCase } from '~/modules/users/application/manage-favorites.use-case';

export async function changePasswordAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        throw new Error('No autorizado.');
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    const useCase = container.resolve<ChangePasswordUseCase>(
        InjectionTokens.ChangePasswordUseCase
    );
    await useCase.execute({
        userId: session.user.id,
        organizationId: session.user.organizationId,
        email: session.user.email,
        currentPassword,
        newPassword,
    });
}

export async function addFavoriteAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        throw new Error('No autorizado.');
    }

    const targetAreaId = formData.get('targetAreaId') as string;
    const alias = formData.get('alias') as string;

    const useCase = container.resolve<ManageFavoritesUseCase>(
        InjectionTokens.ManageFavoritesUseCase
    );
    await useCase.add({
        userId: session.user.id,
        organizationId: session.user.organizationId,
        targetAreaId,
        alias,
    });
    revalidatePath('/profile');
}

export async function removeFavoriteAction(favoriteId: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        throw new Error('No autorizado.');
    }

    const useCase = container.resolve<ManageFavoritesUseCase>(
        InjectionTokens.ManageFavoritesUseCase
    );
    await useCase.remove({
        id: favoriteId,
        userId: session.user.id,
        organizationId: session.user.organizationId,
    });
    revalidatePath('/profile');
}
