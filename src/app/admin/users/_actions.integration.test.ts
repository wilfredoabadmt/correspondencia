import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { redirect } from 'next/navigation';

import {
    listUsers,
    createUser,
    updateUser,
    deleteUser,
} from './_actions';
import { InjectionTokens } from '~/core/injection-tokens';
import type {
    User,
    UserRole,
} from '~/modules/users/core/user.repository';

const mockAuth = vi.fn();
vi.mock('~/modules/auth/lib/auth', () => ({
    auth: mockAuth,
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

const mockListUsersUseCase = { execute: vi.fn() };
const mockCreateUserUseCase = { execute: vi.fn() };
const mockUpdateUserUseCase = { execute: vi.fn() };
const mockDeleteUserUseCase = { execute: vi.fn() };

describe('User Management Server Actions', () => {
    const MOCK_ORG_ID = 'org-123';
    const MOCK_ADMIN_ID = 'user-admin-1';

    const MOCK_ADMIN_SESSION = {
        user: {
            id: MOCK_ADMIN_ID,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'ADMINISTRADOR' as UserRole,
            organizationId: MOCK_ORG_ID,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();

        container.register(InjectionTokens.ListUsersUseCase, {
            useValue: mockListUsersUseCase,
        });
        container.register(InjectionTokens.CreateUserUseCase, {
            useValue: mockCreateUserUseCase,
        });
        container.register(InjectionTokens.UpdateUserUseCase, {
            useValue: mockUpdateUserUseCase,
        });
        container.register(InjectionTokens.DeleteUserUseCase, {
            useValue: mockDeleteUserUseCase,
        });

        mockAuth.mockResolvedValue(MOCK_ADMIN_SESSION);
    });

    it('listUsers should call ListUsersUseCase with correct context and return users', async () => {
        const mockUsers: User[] = [
            { id: 'u1', name: 'User 1', email: 'u1@org.com', organizationId: MOCK_ORG_ID, role: 'ADMINISTRADOR', roleId: 'r1', jobTitle: null, createdAt: new Date(), updatedAt: new Date() },
        ];
        mockListUsersUseCase.execute.mockResolvedValue(mockUsers);

        const result = await listUsers();

        expect(mockListUsersUseCase.execute).toHaveBeenCalledWith({
            organizationId: MOCK_ORG_ID,
            userId: MOCK_ADMIN_ID,
            userRole: 'ADMINISTRADOR',
        });
        expect(result).toEqual(mockUsers);
    });

    it('listUsers should throw an error if ListUsersUseCase fails', async () => {
        mockListUsersUseCase.execute.mockRejectedValue(new Error('Forbidden: Not authorized'));

        await expect(listUsers()).rejects.toThrow('Forbidden: Not authorized');
    });

    it('createUser should call CreateUserUseCase with correct context and return new user', async () => {
        const newUserData = { name: 'New User', email: 'new@org.com', role: 'OPERADOR' as UserRole };
        const mockCreatedUser: User = { ...newUserData, id: 'new-user-id', organizationId: MOCK_ORG_ID, roleId: 'r2', jobTitle: null, createdAt: new Date(), updatedAt: new Date() };
        const mockTemporaryPassword = 'temp_password';
        mockCreateUserUseCase.execute.mockResolvedValue({ user: mockCreatedUser, temporaryPassword: mockTemporaryPassword });

        const result = await createUser(newUserData.name, newUserData.email, newUserData.role);

        expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith({
            ...newUserData,
            organizationId: MOCK_ORG_ID,
            actingUserId: MOCK_ADMIN_ID,
            actingUserRole: 'ADMINISTRADOR',
        });
        expect(result).toEqual({ user: mockCreatedUser, temporaryPassword: mockTemporaryPassword });
    });

    it('updateUser should call UpdateUserUseCase with correct context and return updated user', async () => {
        const updateData = { id: 'u1', name: 'Updated Name', role: 'OPERADOR' as UserRole };
        const mockUpdatedUser: User = { ...updateData, email: 'u1@org.com', organizationId: MOCK_ORG_ID, roleId: 'r2', jobTitle: null, createdAt: new Date(), updatedAt: new Date() };
        mockUpdateUserUseCase.execute.mockResolvedValue(mockUpdatedUser);

        const result = await updateUser(updateData.id, updateData.name, updateData.role);

        expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
            ...updateData,
            organizationId: MOCK_ORG_ID,
            actingUserId: MOCK_ADMIN_ID,
            actingUserRole: 'ADMINISTRADOR',
        });
        expect(result).toEqual(mockUpdatedUser);
    });

    it('deleteUser should call DeleteUserUseCase with correct context', async () => {
        const userIdToDelete = 'u1';
        mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

        await deleteUser(userIdToDelete);

        expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({
            id: userIdToDelete,
            organizationId: MOCK_ORG_ID,
            actingUserId: MOCK_ADMIN_ID,
            actingUserRole: 'ADMINISTRADOR',
        });
    });
});