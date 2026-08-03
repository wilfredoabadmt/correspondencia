import type { users, roleEnum } from '~/db/schema'; // Importar el esquema de usuarios y el enum de roles

// Tipo para el rol de usuario: roles estándar del enum o roles personalizados asignados por el SuperUsuario
export type UserRole = typeof roleEnum.enumValues[number] | string;

// Tipo base para un usuario, omitiendo la contraseña hasheada por seguridad
export type User = Omit<typeof users.$inferSelect, 'hashedPassword'>;

// Tipo para los datos de inserción de un nuevo usuario
export type UserInsertData = {
    name: string;
    email: string;
    organizationId: string;
    role: UserRole;
    hashedPassword: string;
};

// Tipo para los datos de actualización de un usuario
export type UserUpdateData = {
    name?: string;
    role?: UserRole;
    hashedPassword?: string;
};

export interface IUserRepository {
    findManyByOrganizationId(organizationId: string): Promise<User[]>;
    findById(id: string, organizationId: string): Promise<User | null>;
    findByEmail(email: string, organizationId: string): Promise<User | null>;
    create(data: UserInsertData): Promise<User>;
    update(id: string, organizationId: string, data: UserUpdateData): Promise<User | null>;
    delete(id: string, organizationId: string): Promise<void>;
    findHashedPasswordById?(id: string, organizationId: string): Promise<string | null>;
    countAdminsByOrganizationId(organizationId: string): Promise<number>;
}