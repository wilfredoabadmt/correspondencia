import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';

import { InjectionTokens } from '~/core/injection-tokens';
import { CreateRoleUseCase } from './create-role.use-case';
import { IRoleRepository, Role, Permission } from '../core/role.repository';
import { UserRole } from '~/modules/users/core/user.repository';

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

describe('CreateRoleUseCase - Integration Test', () => {
    let createRoleUseCase: CreateRoleUseCase;

    const MOCK_ORG_ID_1 = 'org-1-id';
    const MOCK_ORG_ID_2 = 'org-2-id';
    const MOCK_ADMIN_USER_ID = 'admin-user-id';
    const MOCK_OPERATOR_USER_ID = 'operator-user-id';

    const MOCK_PERMISSIONS: Permission[] = [
        { id: 'document.create', description: 'Crear documentos' },
        { id: 'user.manage', description: 'Gestionar usuarios' },
        { id: 'role.manage', description: 'Gestionar roles' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();

        container.register(InjectionTokens.RoleRepository, { useValue: mockRoleRepository });
        container.register(InjectionTokens.CreateRoleUseCase, { useClass: CreateRoleUseCase });

        createRoleUseCase = container.resolve(InjectionTokens.CreateRoleUseCase);

        // Default mock for findByName to simulate no existing role
        mockRoleRepository.findByName = vi.fn().mockResolvedValue(null);
        // Default mock for create
        mockRoleRepository.create = vi.fn(async (data) => ({
            id: randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            isSystemRole: false,
            name: data.name,
            organizationId: data.organizationId,
            permissions: MOCK_PERMISSIONS.filter(p => data.permissionIds.includes(p.id)),
        }));
    });

    it('should create a new role with specified permissions for an ADMIN user', async () => {
        const roleName = 'New Custom Role';
        const permissionIds = [MOCK_PERMISSIONS[0].id, MOCK_PERMISSIONS[1].id];

        const result = await createRoleUseCase.execute({
            name: roleName,
            permissionIds: permissionIds,
            organizationId: MOCK_ORG_ID_1,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleName, MOCK_ORG_ID_1);
        expect(mockRoleRepository.create).toHaveBeenCalledWith({
            name: roleName,
            organizationId: MOCK_ORG_ID_1,
            permissionIds: permissionIds,
            isSystemRole: false,
        });
        expect(result).toBeDefined();
        expect(result.name).toBe(roleName);
        expect(result.organizationId).toBe(MOCK_ORG_ID_1);
        expect(result.permissions.map(p => p.id)).toEqual(expect.arrayContaining(permissionIds));
    });

    it('should throw a Forbidden error if the user role is not ADMIN', async () => {
        const roleName = 'Unauthorized Role';
        const permissionIds = [MOCK_PERMISSIONS[0].id];

        await expect(
            createRoleUseCase.execute({
                name: roleName,
                permissionIds: permissionIds,
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_OPERATOR_USER_ID,
                actingUserRole: 'OPERADOR' as UserRole, // Unauthorized role
            }),
        ).rejects.toThrow("Forbidden: User with role 'OPERADOR' is not authorized to create roles.");

        expect(mockRoleRepository.findByName).not.toHaveBeenCalled();
        expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });

    it('should throw a Validation Error if a role with the same name already exists in the organization', async () => {
        const roleName = 'Existing Role';
        const existingRole: Role = {
            id: randomUUID(), name: roleName, organizationId: MOCK_ORG_ID_1, isSystemRole: false,
            createdAt: new Date(), updatedAt: new Date(), permissions: []
        };
        mockRoleRepository.findByName = vi.fn().mockResolvedValue(existingRole);

        await expect(
            createRoleUseCase.execute({
                name: roleName,
                permissionIds: [],
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Validation Error: A role with this name already exists in this organization.');

        expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleName, MOCK_ORG_ID_1);
        expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating roles with the same name in different organizations (multi-tenancy)', async () => {
        const roleName = 'Common Role Name';
        // Role in Org1 already created (mocked by default)
        await createRoleUseCase.execute({ name: roleName, permissionIds: [], organizationId: MOCK_ORG_ID_1, actingUserId: MOCK_ADMIN_USER_ID, actingUserRole: 'ADMINISTRADOR' });

        // Now create a role with the same name in Org2
        mockRoleRepository.findByName = vi.fn().mockResolvedValue(null); // Ensure findByName returns null for Org2
        const resultOrg2 = await createRoleUseCase.execute({
            name: roleName,
            permissionIds: [],
            organizationId: MOCK_ORG_ID_2,
            actingUserId: MOCK_ADMIN_USER_ID,
            actingUserRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleName, MOCK_ORG_ID_2);
        expect(mockRoleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            name: roleName,
            organizationId: MOCK_ORG_ID_2,
        }));
        expect(resultOrg2).toBeDefined();
        expect(resultOrg2.organizationId).toBe(MOCK_ORG_ID_2);
    });

    it('should propagate errors from the role repository', async () => {
        mockRoleRepository.create = vi.fn().mockRejectedValue(new Error('Database error during role creation'));

        await expect(
            createRoleUseCase.execute({
                name: 'Error Role',
                permissionIds: [],
                organizationId: MOCK_ORG_ID_1,
                actingUserId: MOCK_ADMIN_USER_ID,
                actingUserRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Database error during role creation');

        expect(mockRoleRepository.findByName).toHaveBeenCalledTimes(1); // Still checks for uniqueness
    });
});