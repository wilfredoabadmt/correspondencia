import 'reflect-metadata';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import { DrizzlePermissionRepository } from './drizzle-permission.repository';
import { IPermissionRepository, Permission } from '../core/permission.repository';

// Mock the DB dependency, even though DrizzlePermissionRepository doesn't use it,
// it's good practice for integration tests in this architecture.
const mockDb = {};

describe('DrizzlePermissionRepository - Integration Test', () => {
    let permissionRepository: IPermissionRepository;

    // The hardcoded list of permissions from DrizzlePermissionRepository
    const EXPECTED_PERMISSIONS_LIST: Permission[] = [
        { id: 'document.create', description: 'Crear nuevos documentos' },
        { id: 'document.view.all', description: 'Ver todos los documentos de la organización' },
        { id: 'document.view.own', description: 'Ver solo documentos propios' },
        { id: 'document.edit.all', description: 'Editar cualquier documento de la organización' },
        { id: 'document.edit.own', description: 'Editar solo documentos propios' },
        { id: 'document.derive', description: 'Derivar documentos a otras áreas' },
        { id: 'document.approve', description: 'Aprobar documentos' },
        { id: 'document.reject', description: 'Rechazar documentos' },
        { id: 'document.delete', description: 'Eliminar documentos' },
        { id: 'user.manage', description: 'Gestionar usuarios (crear, editar, eliminar)' },
        { id: 'user.view', description: 'Ver lista de usuarios' },
        { id: 'area.manage', description: 'Gestionar áreas (crear, editar, eliminar)' },
        { id: 'area.view', description: 'Ver lista de áreas' },
        { id: 'role.manage', description: 'Gestionar roles y permisos (crear, editar, eliminar roles)' },
        { id: 'role.view', description: 'Ver lista de roles y sus permisos' },
        { id: 'organization.settings.manage', description: 'Gestionar la configuración de la organización' },
    ];

    beforeEach(() => {
        container.clearInstances();
        container.register(InjectionTokens.DB, { useValue: mockDb }); // Register mock DB
        container.register(InjectionTokens.PermissionRepository, { useClass: DrizzlePermissionRepository });
        permissionRepository = container.resolve(InjectionTokens.PermissionRepository);
    });

    it('should return the complete list of hardcoded permissions', async () => {
        const permissions = await permissionRepository.findAll();

        expect(permissions).toBeDefined();
        expect(permissions).toHaveLength(EXPECTED_PERMISSIONS_LIST.length);
        expect(permissions).toEqual(expect.arrayContaining(EXPECTED_PERMISSIONS_LIST));
    });
});