import type { users, roleEnum } from '~/db/schema'; // Importar el esquema de usuarios y el enum de roles

// Tipo para el rol de usuario, inferido del pgEnum en el esquema
export type UserRole = typeof roleEnum.enumValues[number];

// Tipo base para un usuario, omitiendo la contraseña hasheada por seguridad
export type User = Omit<typeof users.$inferSelect, 'hashedPassword'>;

// Tipo para los datos de inserción de un nuevo usuario
// Se omiten 'id', 'createdAt', 'updatedAt' porque son generados por la DB
// 'hashedPassword' es requerido para la creación
export type UserInsertData = {
    name: string;
    email: string;
    organizationId: string;
    role: UserRole;
    hashedPassword: string;
};

// Tipo para los datos de actualización de un usuario
// Según la especificación, solo se puede cambiar el nombre y el rol.
// La contraseña hasheada puede ser opcional si se permite cambiar la contraseña.
export type UserUpdateData = {
    name?: string;
    role?: UserRole;
    hashedPassword?: string; // Opcional, para cuando se actualiza la contraseña
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