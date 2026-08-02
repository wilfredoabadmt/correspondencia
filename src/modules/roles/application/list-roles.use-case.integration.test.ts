import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import { ListRolesUseCase } from './list-roles.use-case';
import { IRoleRepository, Role } from '../core/role.repository';
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

describe('ListRolesUseCase - Integration Test', () => {
    let listRolesUseCase: ListRolesUseCase;

    const MOCK_ORG_ID_1 = 'org-1-id';
    const MOCK_ORG_ID_2 = 'org-2-id';
    const MOCK_ADMIN_USER_ID = 'admin-user-id';
    const MOCK_OPERATOR_USER_ID = 'operator-user-id';

    const MOCK_ROLES_ORG_1: Role[] = [
        {
            id: 'role-1-org1',
            name: 'ADMINISTRADOR',
            organizationId: MOCK_ORG_ID_1,
            isSystemRole: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            permissions: [],
        },
        {
            id: 'role-2-org1',
            name: 'OPERADOR',
            organizationId: MOCK_ORG_ID_1,
            isSystemRole: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            permissions: [],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();

        container.register(InjectionTokens.RoleRepository, { useValue: mockRoleRepository });
        container.register(InjectionTokens.ListRolesUseCase, { useClass: ListRolesUseCase });

        listRolesUseCase = container.resolve(InjectionTokens.ListRolesUseCase);

        // Default mock for findManyByOrganizationId
        mockRoleRepository.findManyByOrganizationId = vi.fn().mockResolvedValue(MOCK_ROLES_ORG_1);
    });

    it('should return all roles for an ADMIN user within their organization', async () => {
        const result = await listRolesUseCase.execute({
            organizationId: MOCK_ORG_ID_1,
            userId: MOCK_ADMIN_USER_ID,
            userRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(mockRoleRepository.findManyByOrganizationId).toHaveBeenCalledWith(MOCK_ORG_ID_1);
        expect(result).toEqual(MOCK_ROLES_ORG_1);
    });

    it('should throw a Forbidden error if the user role is not ADMIN', async () => {
        await expect(
            listRolesUseCase.execute({
                organizationId: MOCK_ORG_ID_1,
                userId: MOCK_OPERATOR_USER_ID,
                userRole: 'OPERADOR' as UserRole, // Unauthorized role
            }),
        ).rejects.toThrow("Forbidden: User with role 'OPERADOR' is not authorized to list roles.");

        expect(mockRoleRepository.findManyByOrganizationId).not.toHaveBeenCalled();
    });

    it('should return an empty array if no roles exist in the organization', async () => {
        mockRoleRepository.findManyByOrganizationId = vi.fn().mockResolvedValue([]);

        const result = await listRolesUseCase.execute({
            organizationId: MOCK_ORG_ID_1,
            userId: MOCK_ADMIN_USER_ID,
            userRole: 'ADMINISTRADOR' as UserRole,
        });

        expect(result).toHaveLength(0);
    });

    it('should propagate errors from the role repository', async () => {
        mockRoleRepository.findManyByOrganizationId = vi.fn().mockRejectedValue(new Error('Database error'));

        await expect(
            listRolesUseCase.execute({
                organizationId: MOCK_ORG_ID_1,
                userId: MOCK_ADMIN_USER_ID,
                userRole: 'ADMINISTRADOR' as UserRole,
            }),
        ).rejects.toThrow('Database error');
    });
});