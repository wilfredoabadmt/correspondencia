'use server';

import { auth } from '~/modules/auth/lib/auth';

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

// Default seed roles list including SECRETARIA
let ROLES_STORE: PersistentRoleItem[] = [
    {
        id: 'role-1',
        name: 'SUPERADMIN (Administrador Global)',
        office: 'Oficina Nacional (La Paz)',
        isSystemRole: true,
        description: 'Control absoluto del sistema, creación de organizaciones y administración global de roles.',
        permissions: [
            'document.create', 'document.view.all', 'document.view.own', 'document.derive',
            'document.approve', 'document.reject', 'document.delete', 'user.manage',
            'user.view', 'area.manage', 'area.view', 'role.manage', 'role.view',
            'organization.settings.manage',
        ],
    },
    {
        id: 'role-2',
        name: 'ADMINISTRADOR DE OFICINA',
        office: 'Oficina Nacional (La Paz)',
        isSystemRole: true,
        description: 'Administración de usuarios, áreas y monitoreo gerencial de la Oficina Nacional.',
        permissions: ['document.create', 'document.view.all', 'document.derive', 'user.manage', 'user.view', 'area.manage', 'role.view'],
    },
    {
        id: 'role-3',
        name: 'OPERADOR DE VENTANILLA',
        office: 'Oficina Nacional (La Paz)',
        isSystemRole: false,
        description: 'Recepción de correspondencia externa, asignación de CITEs e impresión de Hojas de Ruta.',
        permissions: ['document.create', 'document.view.own', 'document.derive', 'user.view', 'area.view'],
    },
    {
        id: 'role-4',
        name: 'DIRECTOR DE PLANIFICACIÓN',
        office: 'Dirección Departamental Santa Cruz',
        isSystemRole: false,
        description: 'Supervisión de informes técnicos, aprobación de notas internas y derivación prioritaria.',
        permissions: ['document.create', 'document.view.all', 'document.derive', 'document.approve', 'document.reject', 'user.view', 'area.view'],
    },
    {
        id: 'role-5',
        name: 'SECRETARIA',
        office: 'Oficina Nacional (La Paz)',
        isSystemRole: false,
        description: 'Gestión de correspondencia recibida, atención a ventanilla y despacho de notas internas.',
        permissions: ['document.create', 'document.view.all', 'document.view.own', 'document.derive'],
    },
];

async function checkAuthUser() {
    try {
        const session = await auth();
        if (!session?.user) {
            return { authenticated: false, error: 'Sesión no iniciada o expirada.' };
        }
        return { authenticated: true, user: session.user };
    } catch {
        return { authenticated: false, error: 'Error verificando sesión de usuario.' };
    }
}

export async function fetchPersistentRoles(): Promise<RoleActionResult<PersistentRoleItem[]>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated) {
        return { success: false, error: authCheck.error, data: ROLES_STORE };
    }
    return { success: true, data: ROLES_STORE };
}

export async function createPersistentRole(
    name: string,
    office: string,
    description: string,
    permissions: string[]
): Promise<RoleActionResult<PersistentRoleItem>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated) {
        return { success: false, error: authCheck.error };
    }

    const newRole: PersistentRoleItem = {
        id: `role-${Date.now()}`,
        name: name.trim().toUpperCase(),
        office,
        isSystemRole: false,
        description: description || 'Rol personalizado asignado por Super Usuario.',
        permissions,
        createdAt: new Date().toISOString(),
    };

    ROLES_STORE.unshift(newRole);
    return { success: true, data: newRole };
}

export async function updatePersistentRole(
    id: string,
    name: string,
    office: string,
    description: string,
    permissions: string[]
): Promise<RoleActionResult<PersistentRoleItem>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated) {
        return { success: false, error: authCheck.error };
    }

    const normalizedName = name.trim().toUpperCase();
    const idx = ROLES_STORE.findIndex(r => r.id === id || r.name.toUpperCase() === normalizedName);

    if (idx !== -1) {
        ROLES_STORE[idx] = {
            ...ROLES_STORE[idx],
            name: normalizedName,
            office,
            description: description || 'Rol actualizado por Administrador.',
            permissions,
        };
        return { success: true, data: ROLES_STORE[idx] };
    }

    // Upsert if not found
    const newRole: PersistentRoleItem = {
        id: id || `role-${Date.now()}`,
        name: normalizedName,
        office,
        isSystemRole: false,
        description: description || 'Rol actualizado por Administrador.',
        permissions,
        createdAt: new Date().toISOString(),
    };

    ROLES_STORE.unshift(newRole);
    return { success: true, data: newRole };
}

export async function deletePersistentRole(id: string, roleName?: string): Promise<RoleActionResult<void>> {
    const authCheck = await checkAuthUser();
    if (!authCheck.authenticated) {
        return { success: false, error: authCheck.error };
    }

    const normalizedName = roleName ? roleName.trim().toUpperCase() : '';
    const idx = ROLES_STORE.findIndex(r => r.id === id || (normalizedName && r.name.toUpperCase() === normalizedName));
    if (idx !== -1) {
        ROLES_STORE.splice(idx, 1);
    }
    return { success: true };
}
