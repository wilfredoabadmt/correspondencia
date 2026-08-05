'use server';

import 'reflect-metadata';
import { container, InjectionTokens } from '~/core/container';
import { redirect } from 'next/navigation';

import { auth } from '~/modules/auth/lib/auth';
import { ListUsersUseCase } from '~/modules/users/application/list-users.use-case';
import { CreateUserUseCase } from '~/modules/users/application/create-user.use-case';
import { UpdateUserUseCase } from '~/modules/users/application/update-user.use-case';
import { DeleteUserUseCase } from '~/modules/users/application/delete-user.use-case';
import type { User, UserRole } from '~/modules/users/core/user.repository';

async function getSecurityContext() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const userId = session.user.id || 'user-id';
    const userRole = (session.user as any).role || 'OPERADOR';
    const organizationId = session.user.organizationId;

    if (!organizationId) {
        throw new Error('Unauthorized: User does not belong to an organization.');
    }

    return {
        userId,
        userRole,
        organizationId,
    };
}

export async function listUsers(): Promise<User[]> {
    const { organizationId, userId, userRole } = await getSecurityContext();
    const listUsersUseCase = container.resolve<ListUsersUseCase>(InjectionTokens.ListUsersUseCase);
    return listUsersUseCase.execute({ organizationId, userId, userRole });
}

export async function createUser(name: string, email: string, role: UserRole) {
    const { organizationId, userId, userRole } = await getSecurityContext();
    const createUserUseCase = container.resolve<CreateUserUseCase>(InjectionTokens.CreateUserUseCase);
    return createUserUseCase.execute({
        name,
        email,
        role,
        organizationId,
        actingUserId: userId,
        actingUserRole: userRole,
    });
}

export async function updateUser(id: string, name?: string, role?: UserRole) {
    const { organizationId, userId, userRole } = await getSecurityContext();
    const updateUserUseCase = container.resolve<UpdateUserUseCase>(InjectionTokens.UpdateUserUseCase);
    return updateUserUseCase.execute({
        id,
        name,
        role,
        organizationId,
        actingUserId: userId,
        actingUserRole: userRole,
    });
}

export async function deleteUser(id: string) {
    const { organizationId, userId, userRole } = await getSecurityContext();
    const deleteUserUseCase = container.resolve<DeleteUserUseCase>(InjectionTokens.DeleteUserUseCase);
    return deleteUserUseCase.execute({
        id,
        organizationId,
        actingUserId: userId,
        actingUserRole: userRole,
    });
}