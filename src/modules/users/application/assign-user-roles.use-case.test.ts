import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssignUserRolesUseCase } from './assign-user-roles.use-case';
import type { IUserRoleAssignmentRepository } from '../core/user-role-assignment.repository';

describe('AssignUserRolesUseCase', () => {
    let repo: IUserRoleAssignmentRepository;
    let useCase: AssignUserRolesUseCase;

    beforeEach(() => {
        repo = {
            getUserRoles: vi.fn(),
            assignUserRoles: vi.fn(),
        };

        useCase = new AssignUserRolesUseCase(repo);
    });

    it('debe asignar múltiples roles e ingresar cargo institucional para un usuario', async () => {
        vi.mocked(repo.assignUserRoles).mockResolvedValue();

        await useCase.execute({
            userId: 'user-100',
            organizationId: 'org-1',
            roleIds: ['role-admin', 'role-ventanilla'],
            jobTitle: 'Director de Tecnologías',
        });

        expect(repo.assignUserRoles).toHaveBeenCalledWith({
            userId: 'user-100',
            organizationId: 'org-1',
            roleIds: ['role-admin', 'role-ventanilla'],
            jobTitle: 'Director de Tecnologías',
        });
    });

    it('debe lanzar error si faltan identificadores de usuario o de organización', async () => {
        await expect(useCase.execute({
            userId: '',
            organizationId: 'org-1',
            roleIds: ['role-admin'],
        })).rejects.toThrow('Identificador de usuario y organización son requeridos.');
    });
});
