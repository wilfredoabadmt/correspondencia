import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';

import { InjectionTokens } from '~/core/injection-tokens';
import { DeleteRoleUseCase } from './delete-role.use-case';
import { IRoleRepository, Role, Permission } from '../core/role.repository';
import { UserRole } from '~/modules/users/core/user.repository';
import { AuthorizationService } from '~/core/auth/authorization.service';

// Mock de IRoleRepository
const mockRoleRepository: IRoleRepository = {
    findManyByOrganizationId: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countUsersWithRole: vi.fn(),
    getPermissionsByRoleId: vi.fn(),
    addPermissionsToRole: vi.fn(),
    removePermissionsFromRole: vi.fn(),
};

// Mock de AuthorizationService
const mockAuthorizationService = {
    hasPermission: vi.fn(),
} as unknown as AuthorizationService;

describe('DeleteRoleUseCase - Integration Test', () => {
    let deleteRoleUseCase: DeleteRoleUseCase;

    const MOCK_ORG_ID_1 = 'org-1-id';
    const MOCK_ORG_ID_2 = 'org-2-id';
    const MOCK_ADMIN_USER_ID = 'admin-user-id-1';
    const MOCK_OPERATOR_USER_ID = 'operator-user-id-1';

    const PERM_ROLE_MANAGE: Permission = { id: 'role.manage', description: 'Gestionar roles' };

    const SYSTEM_ADMIN_ROLE_ORG_1: Role = {
        id: 'admin-role-org1',
        name: 'ADMINISTRADOR',
        organizationId: MOCK_ORG_ID_1,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_ROLE_MANAGE],
    };

    const CUSTOM_ROLE_ORG_1: Role = {
        id: 'custom-role-org1',
        name: 'Revisor',
        organizationId: MOCK_ORG_ID_1,
        isSystemRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [],
    };

    const SYSTEM_ADMIN_ROLE_ORG_2: Role = {
        id: 'admin-role-org2',
        name: 'ADMINISTRADOR',
        organizationId: MOCK_ORG_ID_2,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_ROLE_MANAGE],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();

        container.register(InjectionTokens.RoleRepository, { useValue: mockRoleRepository });
        container.register(InjectionTokens.AuthorizationService, { useValue: mockAuthorizationService });
        container.register(InjectionTokens.DeleteRoleUseCase, { useClass: DeleteRoleUseCase });

        deleteRoleUseCase = container.resolve(InjectionTokens.DeleteRoleUseCase);

        // Default mocks
        mockAuthorizationService.hasPermission = vi.fn().mockResolvedValue(true); // Authorized by default
        mockRoleRepository.findById = vi.fn().mockResolvedValue(CUSTOM_ROLE_ORG_1);
        mockRoleRepository.countUsersWithRole = vi.fn().mockResolvedValue(0); // No users by default
        mockRoleRepository.delete = vi.fn().mockResolvedValue(undefined);
    });

    it('should delete a custom role for an authorized ADMIN user', async () => {
        await deleteRoleUseCase.execute({
            id: CUSTOM_ROLE_ORG_1.id,
            organizationId: MOCK_ORG_ID_1,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockAuthorizationService.hasPermission).toHaveBeenCalledWith(MOCK_ADMIN_USER_ID, MOCK_ORG_ID_1, 'role.manage');
        expect(mockRoleRepository.findById).toHaveBeenCalledWith(CUSTOM_ROLE_ORG_1.id, MOCK_ORG_ID_1);
        expect(mockRoleRepository.countUsersWithRole).toHaveBeenCalledWith(CUSTOM_ROLE_ORG_1.id);
        expect(mockRoleRepository.delete).toHaveBeenCalledWith(CUSTOM_ROLE_ORG_1.id, MOCK_ORG_ID_1);
    });

    it('should throw a Forbidden error if the acting user is not authorized', async () => {
        mockAuthorizationService.hasPermission = vi.fn().mockResolvedValue(false); // Unauthorized

        await expect(
            deleteRoleUseCase.execute({
                id: CUSTOM_ROLE_ORG_1.id,
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_OPERATOR_USER_ID,
                actingUserRole: 'OPERADOR' as UserRole,
            }),
        ).rejects.toThrow('Forbidden: User is not authorized to delete roles.');

        expect(mockRoleRepository.findById).not.toHaveBeenCalled();
        expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });

    it('should not throw an error if the role to delete is not found (idempotent)', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(null); // Role not found

        await expect(
            deleteRoleUseCase.execute({
                id: randomUUID(), // Non-existent ID
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).resolves.toBeUndefined(); // Should resolve without error

        expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw a Business Rule Violation if trying to delete a system role', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(SYSTEM_ADMIN_ROLE_ORG_1); // A system role

        await expect(
            deleteRoleUseCase.execute({
                id: SYSTEM_ADMIN_ROLE_ORG_1.id,
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Business Rule Violation: Cannot delete a system role.');

        expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw a Business Rule Violation if trying to delete a role assigned to users', async () => {
        mockRoleRepository.countUsersWithRole = vi.fn().mockResolvedValue(1); // Role has 1 user

        await expect(
            deleteRoleUseCase.execute({
                id: CUSTOM_ROLE_ORG_1.id,
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Business Rule Violation: Cannot delete a role that is currently assigned to users.');

        expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate errors from the role repository', async () => {
        mockRoleRepository.findById = vi.fn().mockRejectedValue(new Error('Database error during find'));

        await expect(
            deleteRoleUseCase.execute({
                id: CUSTOM_ROLE_ORG_1.id,
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Database error during find');

        expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });
});