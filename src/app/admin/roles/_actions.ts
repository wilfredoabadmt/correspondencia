'use server';

import { auth } from '~/modules/auth/lib/auth';
import { redirect } from 'next/navigation';

export interface PersistentRoleItem {
    id: string;
    name: string;
    office: string;
    isSystemRole: boolean;
    permissions: string[];
    description: string;
    createdAt?: string;
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

async function checkSuperAdminAuth() {
    const session = await auth();
    if (!session?.user?.organizationId) {
        redirect('/login');
    }
    const role = (session.user as any).role || 'OPERADOR';
    if (role !== 'SUPERADMIN' && role !== 'ADMINISTRADOR') {
        redirect('/dashboard');
    }
    return session.user;
}

export async function fetchPersistentRoles(): Promise<PersistentRoleItem[]> {
    await checkSuperAdminAuth();
    return ROLES_STORE;
}

export async function createPersistentRole(
    name: string,
    office: string,
    description: string,
    permissions: string[]
): Promise<PersistentRoleItem> {
    await checkSuperAdminAuth();

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
    return newRole;
}

export async function updatePersistentRole(
    id: string,
    name: string,
    office: string,
    description: string,
    permissions: string[]
): Promise<PersistentRoleItem> {
    await checkSuperAdminAuth();

    const idx = ROLES_STORE.findIndex(r => r.id === id);
    if (idx !== -1) {
        ROLES_STORE[idx] = {
            ...ROLES_STORE[idx],
            name: name.trim().toUpperCase(),
            office,
            description: description || 'Rol actualizado por Administrador.',
            permissions,
        };
        return ROLES_STORE[idx];
    }

    throw new Error('Rol no encontrado');
}

export async function deletePersistentRole(id: string): Promise<void> {
    await checkSuperAdminAuth();
    const idx = ROLES_STORE.findIndex(r => r.id === id);
    if (idx !== -1) {
        ROLES_STORE.splice(idx, 1);
    }
}
