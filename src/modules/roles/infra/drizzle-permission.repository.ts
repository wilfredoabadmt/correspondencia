import { injectable } from 'tsyringe';
import type { IPermissionRepository, Permission } from '../core/permission.repository';

@injectable()
export class DrizzlePermissionRepository implements IPermissionRepository {
    // Lista hardcodeada de permisos disponibles en el sistema, según la especificación.
    // Estos permisos no son gestionables por la UI, solo se listan y se asignan a roles.
    private static readonly PERMISSIONS_LIST: Permission[] = [
        // Permisos relacionados con Documentos
        { id: 'document.create', description: 'Crear nuevos documentos' },
        { id: 'document.view.all', description: 'Ver todos los documentos de la organización' },
        { id: 'document.view.own', description: 'Ver solo documentos propios' },
        { id: 'document.edit.all', description: 'Editar cualquier documento de la organización' },
        { id: 'document.edit.own', description: 'Editar solo documentos propios' },
        { id: 'document.derive', description: 'Derivar documentos a otras áreas' },
        { id: 'document.approve', description: 'Aprobar documentos' },
        { id: 'document.reject', description: 'Rechazar documentos' },
        { id: 'document.delete', description: 'Eliminar documentos' },

        // Permisos relacionados con Usuarios
        { id: 'user.manage', description: 'Gestionar usuarios (crear, editar, eliminar)' },
        { id: 'user.view', description: 'Ver lista de usuarios' },

        // Permisos relacionados con Áreas
        { id: 'area.manage', description: 'Gestionar áreas (crear, editar, eliminar)' },
        { id: 'area.view', description: 'Ver lista de áreas' },

        // Permisos relacionados con Roles y Permisos (esta misma feature)
        { id: 'role.manage', description: 'Gestionar roles y permisos (crear, editar, eliminar roles)' },
        { id: 'role.view', description: 'Ver lista de roles y sus permisos' },

        // Permisos generales o de configuración
        { id: 'organization.settings.manage', description: 'Gestionar la configuración de la organización' },
    ];

    /**
     * Devuelve la lista completa de permisos predefinidos.
     * @returns Una promesa que resuelve a un array de permisos.
     */
    async findAll(): Promise<Permission[]> {
        return DrizzlePermissionRepository.PERMISSIONS_LIST;
    }
}