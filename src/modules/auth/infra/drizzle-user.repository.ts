import { and, eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';
import { db } from '~/db';
import * as schema from '~/db/schema';
import type { Role, User } from '../core/user.entity';
import type { IUserRepository } from '../core/user.repository';

@injectable()
export class DrizzleUserRepository implements IUserRepository {
    async findByEmail(email: string, organizationId: string): Promise<User | null> {
        const result = await db
            .select()
            .from(schema.users)
            .where(
                and(
                    eq(schema.users.organizationId, organizationId),
                    eq(schema.users.email, email)
                )
            )
            .limit(1);

        return result.length > 0 ? (result[0] as User) : null;
    }

    async findById(userId: string): Promise<User | null> {
        const result = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, userId))
            .limit(1);

        return result.length > 0 ? (result[0] as User) : null;
    }

    async updateRole(userId: string, role: Role): Promise<User | null> {
        const [updatedUser] = await db
            .update(schema.users)
            .set({ role })
            .where(eq(schema.users.id, userId))
            .returning();

        return (updatedUser as User) ?? null;
    }
}