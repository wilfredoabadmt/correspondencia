import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import { ListAvailablePermissionsUseCase } from './list-available-permissions.use-case';
import { IPermissionRepository, Permission } from '../core/permission.repository';
import { UserRole } from '~/modules/users/core/user.repository';

// Mock the IPermissionRepository
const mockPermissionRepository: IPermissionRepository = {
    findAll: vi.fn(),
};

describe('ListAvailablePermissionsUseCase - Integration Test', () => {
    let listAvailablePermissionsUseCase: ListAvailablePermissionsUseCase;

    const MOCK_ORG_ID = 'org-123';
    const MOCK_USER_ID = 'user-123';

    const MOCK_PERMISSIONS: Permission[] = [
        { id: 'document.create', description: 'Crear documentos' },
        { id: 'user.manage', description: 'Gestionar usuarios' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();

        // Register mocks
        container.register(InjectionTokens.PermissionRepository, {
            useValue: mockPermissionRepository,
        });
        container.register(InjectionTokens.ListAvailablePermissionsUseCase, {
            useClass: ListAvailablePermissionsUseCase,
        });

        listAvailablePermissionsUseCase = container.resolve(
            InjectionTokens.ListAvailablePermissionsUseCase,
        );

        // Default mock for findAll
        mockPermissionRepository.findAll = vi.fn().mockResolvedValue(MOCK_PERMISSIONS);
    });

    it('should return all available permissions for an ADMIN user', async () => {
        const result = await listAvailablePermissionsUseCase.execute({
            organizationId: MOCK_ORG_ID,
            userId: MOCK_USER_ID,
            userRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockPermissionRepository.findAll).toHaveBeenCalledTimes(1);
        expect(result).toEqual(MOCK_PERMISSIONS);
    });

    it('should throw a Forbidden error if the user role is not ADMIN', async () => {
        await expect(
            listAvailablePermissionsUseCase.execute({
                organizationId: MOCK_ORG_ID,
                userId: MOCK_USER_ID,
                userRole: 'OPERADOR' as UserRole, // Unauthorized role
            }),
        ).rejects.toThrow(
            "Forbidden: User with role 'OPERADOR' is not authorized to list available permissions.",
        );

        expect(mockPermissionRepository.findAll).not.toHaveBeenCalled();
    });

    it('should propagate errors from the permission repository', async () => {
        mockPermissionRepository.findAll = vi.fn().mockRejectedValue(new Error('Repository error'));

        await expect(
            listAvailablePermissionsUseCase.execute({
                organizationId: MOCK_ORG_ID,
                userId: MOCK_USER_ID,
                userRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Repository error');
    });
});