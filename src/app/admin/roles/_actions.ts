'use server';

import 'reflect-metadata';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListRolesUseCase } from '~/modules/roles/application/list-roles.use-case';
import type { CreateRoleUseCase } from '~/modules/roles/application/create-role.use-case';
import type { UpdateRoleUseCase } from '~/modules/roles/application/update-role.use-case';
import type { DeleteRoleUseCase } from '~/modules/roles/application/delete-role.use-case';
import type { Role } from '~/modules/roles/core/role.repository';
import type { UserRole } from '~/modules/users/core/user.repository';

export interface PersistentRoleItem {
    id: string;
    name: string;
    office: string;
    isSystemRole: boolean;
    permissions: string[];
    description: string;
    createdAt?: string;
}

export interface RoleActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

async function checkAuthUser() {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return { authenticated: false, error: 'Sesión no iniciada o expirada.' };
        }
        return {
            authenticated: true,
            user: {
                id: session.user.id || 'user-id',
                organizationId: session.user.organizationId,
                role: (session.user as any).role || 'OPERADOR',
            },
        };
    } catch {
        return { authenticated: false, error: 'Error verificando sesión de usuario.' };
    }
}

function mapRoleToItem(role: Role): PersistentRoleItem {
    return {
        id: role.id,
        name: role.name,
        office: 'Oficina Central',
        isSystemRole: role.isSystemRole,
        permissions: (role.permissions || []).map((p) => p.id),
        description: role.isSystemRole
            ? `Rol de sistema ${role.name}`
            : `Rol asignado institucionalmente`,
        createdAt: role.createdAt ? new Date(role.createdAt).toISOString() : undefined,
    };
}

const DEFAULT_SYSTEM_ROLES = [
    {
        name: 'SUPERADMIN',
        permissions: [
            'document.create', 'document.view.all', 'document.view.own', 'document.derive',
            'document.approve', 'document.reject', 'document.delete', 'user.manage',
            'user.view', 'area.manage', 'area.view', 'role.manage', 'role.view',
            'organization.settings.manage',
        ],
    },
    {
        name: 'ADMINISTRADOR',
        permissions: [
            'document.create', 'document.view.all', 'document.derive', 'user.manage',
            'user.view', 'area.manage', 'role.view',
        ],
    },
    {
        name: 'OPERADOR',
        permissions: ['document.create', 'document.view.own', 'document.derive', 'user.view', 'area.view'],
    },
    {
        name: 'SECRETARIA',
        permissions: ['document.create', 'document.view.all', 'document.view.own', 'document.derive'],
    },
];

export async function fetchPersistentRoles(): Promise<RoleActionResult<PersistentRoleItem[]>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated || !authCheck.user) {
        return { success: false, error: authCheck.error };
    }

    try {
        const { organizationId, id: userId, role: userRole } = authCheck.user;
        const listRolesUseCase = container.resolve<ListRolesUseCase>(InjectionTokens.ListRolesUseCase);
        let roles = await listRolesUseCase.execute({
            organizationId,
            userId,
            userRole: userRole as UserRole,
        });

        // Auto-seed system roles in DB if empty for this organization
        if (roles.length === 0) {
            const createRoleUseCase = container.resolve<CreateRoleUseCase>(InjectionTokens.CreateRoleUseCase);
            for (const sysRole of DEFAULT_SYSTEM_ROLES) {
                try {
                    await createRoleUseCase.execute({
                        name: sysRole.name,
                        permissionIds: sysRole.permissions,
                        organizationId,
                        actingUserId: userId,
                        actingUserRole: userRole as UserRole,
                    });
                } catch {
                    // Ignore duplicate errors during seeding
                }
            }
            roles = await listRolesUseCase.execute({
                organizationId,
                userId,
                userRole: userRole as UserRole,
            });
        }

        const items = roles.map(mapRoleToItem);
        return { success: true, data: items };
    } catch (err: any) {
        console.error('Error fetching persistent roles from DB:', err);
        return { success: false, error: err.message || 'Error al obtener roles de la base de datos.' };
    }
}

export async function createPersistentRole(
    name: string,
    office: string,
    description: string,
    permissions: string[]
): Promise<RoleActionResult<PersistentRoleItem>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated || !authCheck.user) {
        return { success: false, error: authCheck.error };
    }

    try {
        const { organizationId, id: userId, role: userRole } = authCheck.user;
        const createRoleUseCase = container.resolve<CreateRoleUseCase>(InjectionTokens.CreateRoleUseCase);

        const newRole = await createRoleUseCase.execute({
            name: name.trim().toUpperCase(),
            permissionIds: permissions,
            organizationId,
            actingUserId: userId,
            actingUserRole: userRole as UserRole,
        });

        return { success: true, data: mapRoleToItem(newRole) };
    } catch (err: any) {
        console.error('Error creating persistent role in DB:', err);
        return { success: false, error: err.message || 'Error al crear el rol en la base de datos.' };
    }
}

export async function updatePersistentRole(
    id: string,
    name: string,
    office: string,
    description: string,
    permissions: string[]
): Promise<RoleActionResult<PersistentRoleItem>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated || !authCheck.user) {
        return { success: false, error: authCheck.error };
    }

    try {
        const { organizationId, id: userId, role: userRole } = authCheck.user;
        const updateRoleUseCase = container.resolve<UpdateRoleUseCase>(InjectionTokens.UpdateRoleUseCase);

        const updatedRole = await updateRoleUseCase.execute({
            id,
            name: name.trim().toUpperCase(),
            permissionIds: permissions,
            organizationId,
            actingUserId: userId,
            actingUserRole: userRole as UserRole,
        });

        if (!updatedRole) {
            return { success: false, error: 'Rol no encontrado o sin cambios.' };
        }

        return { success: true, data: mapRoleToItem(updatedRole) };
    } catch (err: any) {
        console.error('Error updating persistent role in DB:', err);
        return { success: false, error: err.message || 'Error al actualizar el rol en la base de datos.' };
    }
}

export async function deletePersistentRole(id: string, roleName?: string): Promise<RoleActionResult<void>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated || !authCheck.user) {
        return { success: false, error: authCheck.error };
    }

    try {
        const { organizationId, id: userId, role: userRole } = authCheck.user;
        const deleteRoleUseCase = container.resolve<DeleteRoleUseCase>(InjectionTokens.DeleteRoleUseCase);

        await deleteRoleUseCase.execute({
            id,
            organizationId,
            actingUserId: userId,
            actingUserRole: userRole as UserRole,
        });

        return { success: true };
    } catch (err: any) {
        console.error('Error deleting persistent role in DB:', err);
        return { success: false, error: err.message || 'Error al eliminar el rol de la base de datos.' };
    }
}
