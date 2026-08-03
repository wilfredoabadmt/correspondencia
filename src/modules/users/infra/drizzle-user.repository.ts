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

@injectable()
export class DrizzleUserRepository implements IUserRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    private mapToUser(userRow: typeof schema.users.$inferSelect): User {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hashedPassword, ...user } = userRow;
        return user;
    }

    async findManyByOrganizationId(organizationId: string): Promise<User[]> {
        const userRows = await this.db
            .select(getTableColumns(schema.users))
            .from(schema.users)
            .where(eq(schema.users.organizationId, organizationId));

        return userRows.map(this.mapToUser);
    }

    async findById(id: string, organizationId: string): Promise<User | null> {
        const userRow = await this.db
            .select(getTableColumns(schema.users))
            .from(schema.users)
            .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)))
            .limit(1);

        if (userRow.length === 0) {
            return null;
        }

        return this.mapToUser(userRow[0]);
    }

    async findByEmail(email: string, organizationId: string): Promise<User | null> {
        const userRow = await this.db
            .select(getTableColumns(schema.users))
            .from(schema.users)
            .where(
                and(eq(schema.users.email, email), eq(schema.users.organizationId, organizationId)),
            )
            .limit(1);

        if (userRow.length === 0) {
            return null;
        }

        return this.mapToUser(userRow[0]);
    }

    async create(data: UserInsertData): Promise<User> {
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
    }

    async update(id: string, organizationId: string, data: UserUpdateData): Promise<User | null> {
        const [updatedUserRow] = await this.db
            .update(schema.users)
            .set(data)
            .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)))
            .returning(getTableColumns(schema.users));

        if (!updatedUserRow) {
            return null;
        }

        return this.mapToUser(updatedUserRow);
    }

    async delete(id: string, organizationId: string): Promise<void> {
        await this.db
            .delete(schema.users)
            .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)));
    }

    async findHashedPasswordById(id: string, organizationId: string): Promise<string | null> {
        const [row] = await this.db
            .select({ hashedPassword: schema.users.hashedPassword })
            .from(schema.users)
            .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, organizationId)))
            .limit(1);

        return row?.hashedPassword ?? null;
    }

    async countAdminsByOrganizationId(organizationId: string): Promise<number> {
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

        return result?.count ?? 0;
    }
}