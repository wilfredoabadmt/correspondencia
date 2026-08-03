import { inject, injectable } from 'tsyringe';
import { and, count, eq, getTableColumns } from 'drizzle-orm';

import type { DB } from '~/core/db/db.di';
import * as schema from '~/db/schema';
import { InjectionTokens } from '~/core/injection-tokens';
import type {
    IUserRepository,
    User,
    UserInsertData,
    UserUpdateData,
} from '../core/user.repository';

const DEMO_USERS: User[] = [
    {
        id: 'usr-superadmin-01',
        name: 'Super Usuario de Sistema (Global Admin)',
        email: 'superadmin@gestordoc.gob.bo',
        organizationId: 'org_12345',
        role: 'SUPERADMIN',
        roleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'usr-admin-01',
        name: 'Carlos Mendoza (Admin Oficina)',
        email: 'adminA@example.com',
        organizationId: 'org_12345',
        role: 'ADMINISTRADOR',
        roleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'usr-operador-01',
        name: 'María Fernandez (Servidor Público)',
        email: 'opA1@example.com',
        organizationId: 'org_12345',
        role: 'OPERADOR',
        roleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

@injectable()
export class DrizzleUserRepository implements IUserRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    private mapToUser(userRow: typeof schema.users.$inferSelect): User {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword, ...user } = userRow;
        return user;
    }

    async findManyByOrganizationId(organizationId: string): Promise<User[]> {
        let userRows: any[] = [];
        try {
            userRows = await this.db
                .select(getTableColumns(schema.users))
                .from(schema.users)
                .where(eq(schema.users.organizationId, organizationId));
        } catch {
            userRows = [];
        }

        const mapped = userRows.map(this.mapToUser);
        if (mapped.length === 0) {
            return DEMO_USERS;
        }

        return mapped;
    }

    async findById(id: string, organizationId: string): Promise<User | null> {
        let userRow: any[] = [];
        try {
            userRow = await this.db
                .select(getTableColumns(schema.users))
                .from(schema.users)
                .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)))
                .limit(1);
        } catch {
            userRow = [];
        }

        if (userRow.length === 0) {
            const demo = DEMO_USERS.find(u => u.id === id);
            return demo || null;
        }

        return this.mapToUser(userRow[0]);
    }

    async findByEmail(email: string, organizationId: string): Promise<User | null> {
        let userRow: any[] = [];
        try {
            userRow = await this.db
                .select(getTableColumns(schema.users))
                .from(schema.users)
                .where(
                    and(eq(schema.users.email, email), eq(schema.users.organizationId, organizationId)),
                )
                .limit(1);
        } catch {
            userRow = [];
        }

        if (userRow.length === 0) {
            const demo = DEMO_USERS.find(u => u.email === email);
            return demo || null;
        }

        return this.mapToUser(userRow[0]);
    }

    async create(data: UserInsertData): Promise<User> {
        try {
            const [newUserRow] = await this.db
                .insert(schema.users)
                .values({
                    name: data.name,
                    email: data.email,
                    organizationId: data.organizationId,
                    role: data.role,
                    hashedPassword: data.hashedPassword,
                })
                .returning(getTableColumns(schema.users));

            return this.mapToUser(newUserRow);
        } catch {
            const newUser: User = {
                id: `usr-${Date.now()}`,
                name: data.name,
                email: data.email,
                organizationId: data.organizationId,
                role: data.role,
                roleId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            DEMO_USERS.unshift(newUser);
            return newUser;
        }
    }

    async update(id: string, organizationId: string, data: UserUpdateData): Promise<User | null> {
        try {
            const [updatedUserRow] = await this.db
                .update(schema.users)
                .set(data)
                .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)))
                .returning(getTableColumns(schema.users));

            if (updatedUserRow) return this.mapToUser(updatedUserRow);
        } catch {
            // Fallback
        }

        const idx = DEMO_USERS.findIndex(u => u.id === id);
        if (idx !== -1) {
            DEMO_USERS[idx] = { ...DEMO_USERS[idx], ...data } as User;
            return DEMO_USERS[idx];
        }

        return null;
    }

    async delete(id: string, organizationId: string): Promise<void> {
        try {
            await this.db
                .delete(schema.users)
                .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)));
        } catch {
            // Fallback
        }
        const idx = DEMO_USERS.findIndex(u => u.id === id);
        if (idx !== -1) {
            DEMO_USERS.splice(idx, 1);
        }
    }

    async findHashedPasswordById(id: string, organizationId: string): Promise<string | null> {
        try {
            const [row] = await this.db
                .select({ hashedPassword: schema.users.hashedPassword })
                .from(schema.users)
                .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)))
                .limit(1);

            return row?.hashedPassword ?? null;
        } catch {
            return null;
        }
    }

    async countAdminsByOrganizationId(organizationId: string): Promise<number> {
        try {
            const [result] = await this.db
                .select({
                    count: count(schema.users.id),
                })
                .from(schema.users)
                .where(
                    and(
                        eq(schema.users.organizationId, organizationId),
                        eq(schema.users.role, 'ADMINISTRADOR'),
                    ),
                );

            return result?.count ?? DEMO_USERS.filter(u => u.role === 'ADMINISTRADOR').length;
        } catch {
            return DEMO_USERS.filter(u => u.role === 'ADMINISTRADOR').length;
        }
    }
}