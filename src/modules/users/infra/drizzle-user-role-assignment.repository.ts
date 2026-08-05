import { inject, injectable } from 'tsyringe';
import { and, eq } from 'drizzle-orm';
import type { DB } from '@/core/db/db.di';
import * as schema from '@/db/schema';
import type { IUserRoleAssignmentRepository, UserRoleAssignment } from '../core/user-role-assignment.repository';
import { InjectionTokens } from '~/core/injection-tokens';

@injectable()
export class DrizzleUserRoleAssignmentRepository implements IUserRoleAssignmentRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    async getUserRoles(userId: string, organizationId: string): Promise<UserRoleAssignment[]> {
        const rows = await this.db
            .select({
                userId: schema.userRoles.userId,
                roleId: schema.userRoles.roleId,
                roleName: schema.roles.name,
            })
            .from(schema.userRoles)
            .leftJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
            .where(
                and(
                    eq(schema.userRoles.userId, userId),
                    eq(schema.userRoles.organizationId, organizationId)
                )
            );

        return rows.map((r) => ({
            userId: r.userId,
            roleId: r.roleId,
            roleName: r.roleName || undefined,
        }));
    }

    async assignUserRoles({
        userId,
        organizationId,
        roleIds,
        jobTitle,
    }: {
        userId: string;
        organizationId: string;
        roleIds: string[];
        jobTitle?: string | null;
    }): Promise<void> {
        await this.db.transaction(async (tx) => {
            // Update jobTitle in users table
            if (jobTitle !== undefined) {
                await tx
                    .update(schema.users)
                    .set({ jobTitle, updatedAt: new Date() })
                    .where(eq(schema.users.id, userId));
            }

            // Remove existing user_roles
            await tx
                .delete(schema.userRoles)
                .where(
                    and(
                        eq(schema.userRoles.userId, userId),
                        eq(schema.userRoles.organizationId, organizationId)
                    )
                );

            // Insert new user_roles
            if (roleIds.length > 0) {
                const newRows = roleIds.map((roleId) => ({
                    userId,
                    roleId,
                    organizationId,
                }));
                await tx.insert(schema.userRoles).values(newRows);
            }
        });
    }
}
