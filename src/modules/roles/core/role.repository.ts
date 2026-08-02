import type { roles, permissions } from '~/db/schema'; // Importar el esquema de roles y permisos

// Tipo para un permiso individual
export type Permission = typeof permissions.$inferSelect;

// Tipo base para un rol, incluyendo sus permisos asociados
export type Role = typeof roles.$inferSelect & {
    permissions: Permission[];
};

// Tipo para los datos de inserción de un nuevo rol
// Se omiten 'id', 'createdAt', 'updatedAt' porque son generados por la DB
export type RoleInsertData = {
    name: string;
    organizationId: string;
    isSystemRole?: boolean; // Opcional, por defecto false
    permissionIds: string[]; // IDs de los permisos a asignar al rol
};

// Tipo para los datos de actualización de un rol
export type RoleUpdateData = {
    name?: string;
    permissionIds?: string[]; // IDs de los permisos a asignar/reemplazar
};

export interface IRoleRepository {
    /**
     * Busca todos los roles de una organización, incluyendo sus permisos.
     * @param organizationId El ID de la organización.
     * @returns Una promesa que resuelve a un array de roles.
     */
    findManyByOrganizationId(organizationId: string): Promise<Role[]>;

    /**
     * Busca un rol por su ID y organización, incluyendo sus permisos.
     * @param id El ID del rol.
     * @param organizationId El ID de la organización.
     * @returns Una promesa que resuelve al rol encontrado o null.
     */
    findById(id: string, organizationId: string): Promise<Role | null>;

    /**
     * Busca un rol por su nombre y organización, incluyendo sus permisos.
     * @param name El nombre del rol.
     * @param organizationId El ID de la organización.
     * @returns Una promesa que resuelve al rol encontrado o null.
     */
    findByName(name: string, organizationId: string): Promise<Role | null>;

    /**
     * Crea un nuevo rol con los permisos especificados.
     * @param data Los datos para crear el rol.
     * @returns Una promesa que resuelve al rol creado.
     */
    create(data: RoleInsertData): Promise<Role>;

    /**
     * Actualiza un rol existente con los datos y permisos especificados.
     * @param id El ID del rol a actualizar.
     * @param organizationId El ID de la organización.
     * @param data Los datos para actualizar el rol.
     * @returns Una promesa que resuelve al rol actualizado o null.
     */
    update(id: string, organizationId: string, data: RoleUpdateData): Promise<Role | null>;

    /**
     * Elimina un rol por su ID y organización.
     * @param id El ID del rol a eliminar.
     * @param organizationId El ID de la organización.
     * @returns Una promesa que resuelve cuando el rol ha sido eliminado.
     */
    delete(id: string, organizationId: string): Promise<void>;

    /**
     * Cuenta el número de usuarios asignados a un rol específico.
     * @param roleId El ID del rol.
     * @returns Una promesa que resuelve al número de usuarios con ese rol.
     */
    countUsersWithRole(roleId: string): Promise<number>;

    /**
     * Obtiene todos los permisos asociados a un rol.
     * @param roleId El ID del rol.
     * @returns Una promesa que resuelve a un array de permisos.
     */
    getPermissionsByRoleId(roleId: string): Promise<Permission[]>;

    /**
     * Añade permisos a un rol.
     * @param roleId El ID del rol.
     * @param permissionIds Los IDs de los permisos a añadir.
     * @returns Una promesa que resuelve cuando los permisos han sido añadidos.
     */
    addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void>;

    /**
     * Elimina permisos de un rol.
     * @param roleId El ID del rol.
     * @param permissionIds Los IDs de los permisos a eliminar.
     * @returns Una promesa que resuelve cuando los permisos han sido eliminados.
     */
    removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void>;
}