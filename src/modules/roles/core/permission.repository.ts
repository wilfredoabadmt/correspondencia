import type { permissions } from '~/db/schema'; // Importar el esquema de permisos

// Tipo para un permiso individual, inferido del esquema de Drizzle
export type Permission = typeof permissions.$inferSelect;

export interface IPermissionRepository {
    /**
     * Busca todos los permisos disponibles en el sistema.
     * Estos permisos son predefinidos y no gestionables por la UI.
     * @returns Una promesa que resuelve a un array de permisos.
     */
    findAll(): Promise<Permission[]>;
}