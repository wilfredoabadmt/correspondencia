import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import { AuthorizationService } from './authorization.service';
import { IUserRepository, User } from '~/modules/users/core/user.repository';
import { IRoleRepository, Role, Permission } from '~/modules/roles/core/role.repository';

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

describe('AuthorizationService - Integration Test', () => {
    let authorizationService: AuthorizationService;

    const MOCK_ORG_ID_1 = 'org-1-id';
    const MOCK_ORG_ID_2 = 'org-2-id';

    const PERM_ROLE_MANAGE: Permission = { id: 'role.manage', description: 'Gestionar roles' };
    const PERM_DOCUMENT_CREATE: Permission = { id: 'document.create', description: 'Crear documento' };
    const PERM_DOCUMENT_VIEW_ALL: Permission = { id: 'document.view.all', description: 'Ver todos los documentos' };

    const ADMIN_ROLE_ORG_1: Role = {
        id: 'admin-role-org1',
        name: 'ADMINISTRADOR',
        organizationId: MOCK_ORG_ID_1,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_ROLE_MANAGE, PERM_DOCUMENT_CREATE, PERM_DOCUMENT_VIEW_ALL],
    };

    const OPERATOR_ROLE_ORG_1: Role = {
        id: 'operator-role-org1',
        name: 'OPERADOR',
        organizationId: MOCK_ORG_ID_1,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_DOCUMENT_CREATE, PERM_DOCUMENT_VIEW_ALL], // No role.manage
    };

    const ADMIN_ROLE_ORG_2: Role = {
        id: 'admin-role-org2',
        name: 'ADMINISTRADOR',
        organizationId: MOCK_ORG_ID_2,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [PERM_ROLE_MANAGE, PERM_DOCUMENT_CREATE, PERM_DOCUMENT_VIEW_ALL],
    };

    const ADMIN_USER_ORG_1: User = {
        id: 'admin-user-org1',
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
        id: 'operator-user-org1',
        name: 'Operator Org1',
        email: 'operator1@org1.com',
        organizationId: MOCK_ORG_ID_1,
        role: 'OPERADOR',
        roleId: OPERATOR_ROLE_ORG_1.id,
        jobTitle: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const ADMIN_USER_ORG_2: User = {
        id: 'admin-user-org2',
        name: 'Admin Org2',
        email: 'admin1@org2.com',
        organizationId: MOCK_ORG_ID_2,
        role: 'ADMINISTRADOR',
        roleId: ADMIN_ROLE_ORG_2.id,
        jobTitle: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();

        container.register(InjectionTokens.UserRepository, { useValue: mockUserRepository });
        container.register(InjectionTokens.RoleRepository, { useValue: mockRoleRepository });
        container.register(InjectionTokens.AuthorizationService, { useClass: AuthorizationService });

        authorizationService = container.resolve(InjectionTokens.AuthorizationService);
    });

    it('should return true if an ADMIN user has the required permission', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(ADMIN_USER_ORG_1);
        mockRoleRepository.findById = vi.fn().mockResolvedValue(ADMIN_ROLE_ORG_1);

        const result = await authorizationService.hasPermission(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_1, 'role.manage');
        expect(result).toBe(true);
        expect(mockUserRepository.findById).toHaveBeenCalledWith(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_1);
        expect(mockRoleRepository.findById).toHaveBeenCalledWith(ADMIN_ROLE_ORG_1.id, MOCK_ORG_ID_1);
    });

    it('should return false if an OPERATOR user does not have the required permission', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(OPERATOR_USER_ORG_1);
        mockRoleRepository.findById = vi.fn().mockResolvedValue(OPERATOR_ROLE_ORG_1);

        const result = await authorizationService.hasPermission(OPERATOR_USER_ORG_1.id, MOCK_ORG_ID_1, 'role.manage');
        expect(result).toBe(false);
    });

    it('should return true if an OPERATOR user has a non-admin permission', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(OPERATOR_USER_ORG_1);
        mockRoleRepository.findById = vi.fn().mockResolvedValue(OPERATOR_ROLE_ORG_1);

        const result = await authorizationService.hasPermission(OPERATOR_USER_ORG_1.id, MOCK_ORG_ID_1, 'document.create');
        expect(result).toBe(true);
    });

    it('should return false if the user is not found', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(null);

        const result = await authorizationService.hasPermission('non-existent-user', MOCK_ORG_ID_1, 'role.manage');
        expect(result).toBe(false);
        expect(mockRoleRepository.findById).not.toHaveBeenCalled(); // Should not try to find role if user is null
    });

    it('should return false if the user\'s role is not found', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue({ ...ADMIN_USER_ORG_1, roleId: 'non-existent-role' });
        mockRoleRepository.findById = vi.fn().mockResolvedValue(null);

        const result = await authorizationService.hasPermission(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_1, 'role.manage');
        expect(result).toBe(false);
        expect(mockUserRepository.findById).toHaveBeenCalledWith(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_1);
        expect(mockRoleRepository.findById).toHaveBeenCalledWith('non-existent-role', MOCK_ORG_ID_1);
    });

    it('should enforce multi-tenancy for user lookup', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(null); // Simulate user not found in MOCK_ORG_1

        const result = await authorizationService.hasPermission(ADMIN_USER_ORG_2.id, MOCK_ORG_ID_1, 'role.manage'); // Try to check Org2 user in Org1
        expect(result).toBe(false);
        expect(mockUserRepository.findById).toHaveBeenCalledWith(ADMIN_USER_ORG_2.id, MOCK_ORG_ID_1);
        expect(mockRoleRepository.findById).not.toHaveBeenCalled();
    });

    it('should enforce multi-tenancy for role lookup', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(ADMIN_USER_ORG_1);
        mockRoleRepository.findById = vi.fn().mockResolvedValue(null); // Simulate role not found in MOCK_ORG_2

        const result = await authorizationService.hasPermission(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_2, 'role.manage'); // Try to check Org1 user's role in Org2
        expect(result).toBe(false);
        expect(mockUserRepository.findById).toHaveBeenCalledWith(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_2);
        expect(mockRoleRepository.findById).toHaveBeenCalledWith(ADMIN_ROLE_ORG_1.id, MOCK_ORG_ID_2);
    });

    it('should return false if the permission is not found in the role', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(ADMIN_USER_ORG_1);
        mockRoleRepository.findById = vi.fn().mockResolvedValue(ADMIN_ROLE_ORG_1);

        const result = await authorizationService.hasPermission(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_1, 'non.existent.permission');
        expect(result).toBe(false);
    });

    it('should propagate errors from userRepository', async () => {
        mockUserRepository.findById = vi.fn().mockRejectedValue(new Error('DB error on user lookup'));

        await expect(authorizationService.hasPermission(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_1, 'role.manage'))
            .rejects.toThrow('DB error on user lookup');
    });

    it('should propagate errors from roleRepository', async () => {
        mockUserRepository.findById = vi.fn().mockResolvedValue(ADMIN_USER_ORG_1);
        mockRoleRepository.findById = vi.fn().mockRejectedValue(new Error('DB error on role lookup'));

        await expect(authorizationService.hasPermission(ADMIN_USER_ORG_1.id, MOCK_ORG_ID_1, 'role.manage'))
            .rejects.toThrow('DB error on role lookup');
    });
});