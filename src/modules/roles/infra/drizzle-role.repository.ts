import { inject, injectable } from 'tsyringe';
import { and, eq, inArray, sql, count } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import type { DB } from '~/core/db/db.di';
import * as schema from '~/db/schema';
import { InjectionTokens } from '~/core/injection-tokens';
import type {
    IRoleRepository,
    Role,
    RoleInsertData,
    RoleUpdateData,
    Permission,
} from '../core/role.repository';

@injectable()
export class DrizzleRoleRepository implements IRoleRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    private mapRowsToRoles(
        rows: Array<{ role: typeof schema.roles.$inferSelect; permission: typeof schema.permissions.$inferSelect | null }>,
    ): Role[] {
        const rolesMap = new Map<string, Role>();

        for (const row of rows) {
            if (!rolesMap.has(row.role.id)) {
                rolesMap.set(row.role.id, {
                    ...row.role,
                    permissions: [],
                });
            }

            if (row.permission) {
                const role = rolesMap.get(row.role.id)!;
                if (!role.permissions.some((p) => p.id === row.permission!.id)) {
                    role.permissions.push(row.permission);
                }
            }
        }

        return Array.from(rolesMap.values());
    }

    async findManyByOrganizationId(organizationId: string): Promise<Role[]> {
        const rows = await this.db
            .select({
                role: schema.roles,
                permission: schema.permissions,
            })
            .from(schema.roles)
            .leftJoin(schema.rolePermissions, eq(schema.roles.id, schema.rolePermissions.roleId))
            .leftJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
            .where(eq(schema.roles.organizationId, organizationId));

        return this.mapRowsToRoles(rows);
    }

    async findById(id: string, organizationId: string): Promise<Role | null> {
        const rows = await this.db
            .select({
                role: schema.roles,
                permission: schema.permissions,
            })
            .from(schema.roles)
            .leftJoin(schema.rolePermissions, eq(schema.roles.id, schema.rolePermissions.roleId))
            .leftJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
            .where(and(eq(schema.roles.id, id), eq(schema.roles.organizationId, organizationId)));

        const roles = this.mapRowsToRoles(rows);
        return roles.length > 0 ? roles[0] : null;
    }

    async findByName(name: string, organizationId: string): Promise<Role | null> {
        const rows = await this.db
            .select({
                role: schema.roles,
                permission: schema.permissions,
            })
            .from(schema.roles)
            .leftJoin(schema.rolePermissions, eq(schema.roles.id, schema.rolePermissions.roleId))
            .leftJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
            .where(and(eq(schema.roles.name, name), eq(schema.roles.organizationId, organizationId)));

        const roles = this.mapRowsToRoles(rows);
        return roles.length > 0 ? roles[0] : null;
    }

    async create(data: RoleInsertData): Promise<Role> {
        const { permissionIds, name, organizationId, isSystemRole } = data;

        const newRole = await this.db.transaction(async (tx) => {
            const [insertedRole] = await tx
                .insert(schema.roles)
                .values({
                    id: createId(),
                    name,
                    organizationId,
                    isSystemRole: isSystemRole ?? false,
                })
                .returning();

            if (permissionIds && permissionIds.length > 0) {
                const rolePermissionsToInsert = permissionIds.map((permissionId) => ({
                    roleId: insertedRole.id,
                    permissionId,
                }));
                await tx.insert(schema.rolePermissions).values(rolePermissionsToInsert);
            }

            const rows = await tx
                .select({
                    role: schema.roles,
                    permission: schema.permissions,
                })
                .from(schema.roles)
                .leftJoin(schema.rolePermissions, eq(schema.roles.id, schema.rolePermissions.roleId))
                .leftJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
                .where(eq(schema.roles.id, insertedRole.id));

            const roles = this.mapRowsToRoles(rows);
            return roles[0];
        });

        return newRole;
    }

    async update(id: string, organizationId: string, data: RoleUpdateData): Promise<Role | null> {
        const { permissionIds, ...roleData } = data;

        const updatedRole = await this.db.transaction(async (tx) => {
            const [updatedRoleRow] = await tx
                .update(schema.roles)
                .set({ ...roleData, updatedAt: sql`now()` })
                .where(and(eq(schema.roles.id, id), eq(schema.roles.organizationId, organizationId)))
                .returning();

            if (!updatedRoleRow) {
                return null;
            }

            if (permissionIds !== undefined) {
                await tx.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, id));
                if (permissionIds.length > 0) {
                    const rolePermissionsToInsert = permissionIds.map((permissionId) => ({
                        roleId: id,
                        permissionId,
                    }));
                    await tx.insert(schema.rolePermissions).values(rolePermissionsToInsert);
                }
            }

            const rows = await tx
                .select({
                    role: schema.roles,
                    permission: schema.permissions,
                })
                .from(schema.roles)
                .leftJoin(schema.rolePermissions, eq(schema.roles.id, schema.rolePermissions.roleId))
                .leftJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
                .where(eq(schema.roles.id, updatedRoleRow.id));

            const roles = this.mapRowsToRoles(rows);
            return roles[0];
        });

        return updatedRole;
    }

    async delete(id: string, organizationId: string): Promise<void> {
        await this.db
            .delete(schema.roles)
            .where(and(eq(schema.roles.id, id), eq(schema.roles.organizationId, organizationId)));
    }

    async countUsersWithRole(roleId: string): Promise<number> {
        const [result] = await this.db
            .select({
                count: count(schema.users.id),
            })
            .from(schema.users)
            .where(eq(schema.users.roleId, roleId));

        return result?.count ?? 0;
    }

    async getPermissionsByRoleId(roleId: string): Promise<Permission[]> {
        const rows = await this.db
            .select({
                id: schema.permissions.id,
                description: schema.permissions.description,
            })
            .from(schema.rolePermissions)
            .innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
            .where(eq(schema.rolePermissions.roleId, roleId));

        return rows;
    }

    async addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
        if (permissionIds.length === 0) {
            return;
        }
        const rolePermissionsToInsert = permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
        }));
        await this.db.insert(schema.rolePermissions).values(rolePermissionsToInsert).onConflictDoNothing();
    }

    async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void> {
        if (permissionIds.length === 0) {
            return;
        }
        await this.db
            .delete(schema.rolePermissions)
            .where(and(eq(schema.rolePermissions.roleId, roleId), inArray(schema.rolePermissions.permissionId, permissionIds)));
    }
}