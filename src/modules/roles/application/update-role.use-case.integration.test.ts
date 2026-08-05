import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';

import { InjectionTokens } from '~/core/injection-tokens';
import { UpdateRoleUseCase } from './update-role.use-case';
import { IRoleRepository, Role, Permission } from '../core/role.repository';
import { IUserRepository, User, UserRole } from '~/modules/users/core/user.repository';

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

// Mock de IUserRepository
const mockUserRepository: IUserRepository = {
    findManyByOrganizationId: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countAdminsByOrganizationId: vi.fn(),
};

describe('UpdateRoleUseCase - Integration Test', () => {
    let updateRoleUseCase: UpdateRoleUseCase;

    const MOCK_ORG_ID_1 = 'org-1-id';
    const MOCK_ORG_ID_2 = 'org-2-id';
    const MOCK_ADMIN_USER_ID = 'admin-user-id-1';
    const MOCK_OPERATOR_USER_ID = 'operator-user-id-1';
    const MOCK_OTHER_ADMIN_USER_ID = 'admin-user-id-2';

    const PERM_ROLE_MANAGE: Permission = { id: 'role.manage', description: 'Gestionar roles' };
    const PERM_USER_MANAGE: Permission = { id: 'user.manage', description: 'Gestionar usuarios' };
    const PERM_DOCUMENT_CREATE: Permission = { id: 'document.create', description: 'Crear documento' };

    const ADMIN_ROLE_ORG_1: Role = {
        id: 'admin-role-org1',
        name: 'ADMINISTRADOR',
        organizationId: MOCK_ORG_ID_1,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_ROLE_MANAGE, PERM_USER_MANAGE, PERM_DOCUMENT_CREATE],
    };

    const OPERATOR_ROLE_ORG_1: Role = {
        id: 'operator-role-org1',
        name: 'OPERADOR',
        organizationId: MOCK_ORG_ID_1,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_DOCUMENT_CREATE],
    };

    const CUSTOM_ROLE_ORG_1: Role = {
        id: 'custom-role-org1',
        name: 'Revisor',
        organizationId: MOCK_ORG_ID_1,
        isSystemRole: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_DOCUMENT_CREATE, PERM_USER_MANAGE],
    };

    const ADMIN_USER_ORG_1: User = {
        id: MOCK_ADMIN_USER_ID,
        name: 'Admin Org1',
        email: 'admin1@org1.com',
        organizationId: MOCK_ORG_ID_1,
        role: 'ADMINISTRADOR',
        roleId: ADMIN_ROLE_ORG_1.id,
        jobTitle: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const OPERATOR_USER_ORG_1: User = {
        id: MOCK_OPERATOR_USER_ID,
        name: 'Operator Org1',
        email: 'operator1@org1.com',
        organizationId: MOCK_ORG_ID_1,
        role: 'OPERADOR',
        roleId: OPERATOR_ROLE_ORG_1.id,
        jobTitle: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();

        container.register(InjectionTokens.RoleRepository, { useValue: mockRoleRepository });
        container.register(InjectionTokens.UserRepository, { useValue: mockUserRepository });
        container.register(InjectionTokens.UpdateRoleUseCase, { useClass: UpdateRoleUseCase });

        updateRoleUseCase = container.resolve(InjectionTokens.UpdateRoleUseCase);

        // Default mocks
        mockRoleRepository.findById = vi.fn().mockResolvedValue(ADMIN_ROLE_ORG_1);
        mockRoleRepository.update = vi.fn(async (id, orgId, data) => ({
            ...ADMIN_ROLE_ORG_1,
            id,
            organizationId: orgId,
            ...data,
            permissions: data.permissionIds ? data.permissionIds.map(pId => ({ id: pId, description: '' })) : ADMIN_ROLE_ORG_1.permissions,
        }));
        mockUserRepository.findById = vi.fn().mockResolvedValue(ADMIN_USER_ORG_1);
    });

    it('should update a custom role name and permissions for an ADMIN user', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(CUSTOM_ROLE_ORG_1);
        const updatedName = 'New Revisor Name';
        const newPermissionIds = [PERM_DOCUMENT_CREATE.id];

        const result = await updateRoleUseCase.execute({
            id: CUSTOM_ROLE_ORG_1.id,
            name: updatedName,
            permissionIds: newPermissionIds,
            organizationId: MOCK_ORG_ID_1,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockRoleRepository.findById).toHaveBeenCalledWith(CUSTOM_ROLE_ORG_1.id, MOCK_ORG_ID_1);
        expect(mockRoleRepository.update).toHaveBeenCalledWith(
            CUSTOM_ROLE_ORG_1.id,
            MOCK_ORG_ID_1,
            { name: updatedName, permissionIds: newPermissionIds },
        );
        expect(result).toBeDefined();
        expect(result?.name).toBe(updatedName);
        expect(result?.permissions.map(p => p.id)).toEqual(expect.arrayContaining(newPermissionIds));
    });

    it('should throw a Forbidden error if the acting user role is not ADMIN', async () => {
        await expect(
            updateRoleUseCase.execute({
                id: CUSTOM_ROLE_ORG_1.id,
                name: 'Unauthorized Change',
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_OPERATOR_USER_ID,
                actingUserRole: 'OPERADOR' as UserRole, // Unauthorized role
            }),
        ).rejects.toThrow("Forbidden: User is not authorized to update roles.");

        expect(mockRoleRepository.findById).not.toHaveBeenCalled();
        expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should return null when updating a non-existent role in the organization', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(null); // Simulate role not found

        const result = await updateRoleUseCase.execute({
            id: randomUUID(), // Non-existent ID
            name: 'Non Existent',
            organizationId: MOCK_ORG_ID_1,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(result).toBeNull();
        expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should return null when updating a role from another organization (multi-tenancy)', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(null); // findById will return null for Org2

        const result = await updateRoleUseCase.execute({
            id: ADMIN_ROLE_ORG_1.id, // Role from Org1
            name: 'Attempted Change',
            organizationId: MOCK_ORG_ID_2, // Acting from Org2
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(result).toBeNull();
        expect(mockRoleRepository.findById).toHaveBeenCalledWith(ADMIN_ROLE_ORG_1.id, MOCK_ORG_ID_2);
        expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw a Business Rule Violation if trying to rename a system role', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(ADMIN_ROLE_ORG_1); // A system role

        await expect(
            updateRoleUseCase.execute({
                id: ADMIN_ROLE_ORG_1.id,
                name: 'New Admin Name', // Trying to rename system role
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Business Rule Violation: Cannot rename a system role.');

        expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating permissions of a system role', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(OPERATOR_ROLE_ORG_1); // A system role
        const newPermissionIds = [PERM_DOCUMENT_CREATE.id, PERM_USER_MANAGE.id];

        const result = await updateRoleUseCase.execute({
            id: OPERATOR_ROLE_ORG_1.id,
            permissionIds: newPermissionIds,
            organizationId: MOCK_ORG_ID_1,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockRoleRepository.update).toHaveBeenCalledWith(
            OPERATOR_ROLE_ORG_1.id,
            MOCK_ORG_ID_1,
            { permissionIds: newPermissionIds },
        );
        expect(result).toBeDefined();
        expect(result?.permissions.map(p => p.id)).toEqual(expect.arrayContaining(newPermissionIds));
    });

    it('should throw a Business Rule Violation if an ADMIN tries to remove critical permissions from their own role', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(ADMIN_ROLE_ORG_1); // The acting user's role
        mockUserRepository.findById = vi.fn().mockResolvedValue(ADMIN_USER_ORG_1); // The acting user

        const newPermissionIds = [PERM_DOCUMENT_CREATE.id]; // Missing 'role.manage' and 'user.manage'

        await expect(
            updateRoleUseCase.execute({
                id: ADMIN_ROLE_ORG_1.id, // Updating own role
                permissionIds: newPermissionIds,
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Business Rule Violation: Cannot remove critical permission \'role.manage\' from your own role.');

        expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should allow an ADMIN to remove non-critical permissions from their own role', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(ADMIN_ROLE_ORG_1);
        mockUserRepository.findById = vi.fn().mockResolvedValue(ADMIN_USER_ORG_1);

        const newPermissionIds = [PERM_ROLE_MANAGE.id, PERM_USER_MANAGE.id]; // Removing PERM_DOCUMENT_CREATE

        const result = await updateRoleUseCase.execute({
            id: ADMIN_ROLE_ORG_1.id,
            permissionIds: newPermissionIds,
            organizationId: MOCK_ORG_ID_1,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockRoleRepository.update).toHaveBeenCalledWith(
            ADMIN_ROLE_ORG_1.id,
            MOCK_ORG_ID_1,
            { permissionIds: newPermissionIds },
        );
        expect(result).toBeDefined();
        expect(result?.permissions.map(p => p.id)).toEqual(expect.arrayContaining(newPermissionIds));
    });

    it('should return the existing role if no update data is provided', async () => {
        mockRoleRepository.findById = vi.fn().mockResolvedValue(CUSTOM_ROLE_ORG_1);
        mockRoleRepository.update = vi.fn(); // Ensure update is not called

        const result = await updateRoleUseCase.execute({
            id: CUSTOM_ROLE_ORG_1.id,
            organizationId: MOCK_ORG_ID_1,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(result).toEqual(CUSTOM_ROLE_ORG_1);
        expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from the role repository', async () => {
        mockRoleRepository.update = vi.fn().mockRejectedValue(new Error('Database error during role update'));

        await expect(
            updateRoleUseCase.execute({
                id: CUSTOM_ROLE_ORG_1.id,
                name: 'Error Role',
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Database error during role update');
    });

    it('should propagate errors from the userRepository when checking critical permissions', async () => {
        mockUserRepository.findById = vi.fn().mockRejectedValue(new Error('User DB error'));
        mockRoleRepository.findById = vi.fn().mockResolvedValue(ADMIN_ROLE_ORG_1); // Acting user's role

        await expect(
            updateRoleUseCase.execute({
                id: ADMIN_ROLE_ORG_1.id,
                permissionIds: [PERM_DOCUMENT_CREATE.id], // Attempt to remove critical
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('User DB error');
    });
});