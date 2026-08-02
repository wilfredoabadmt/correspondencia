import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

import * as schema from '~/db/schema';
import { InjectionTokens } from '~/core/injection-tokens';
import { DrizzleRoleRepository } from './drizzle-role.repository';
import { IRoleRepository, Role, Permission } from '../core/role.repository';
import { DrizzlePermissionRepository } from './drizzle-permission.repository';

// This test requires a running PostgreSQL database configured via DATABASE_URL_TEST
describe('DrizzleRoleRepository - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client: postgres.Sql;
    let roleRepository: IRoleRepository;
    let permissionRepository: DrizzlePermissionRepository;

    // Test data
    let org1: typeof schema.organizations.$inferSelect;
    let org2: typeof schema.organizations.$inferSelect;
    let allPermissions: Permission[];

    // Run migrations once before all tests
    beforeAll(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        const migrationClient = postgres(process.env.DATABASE_URL_TEST, { max: 1 });
        await migrate(drizzle(migrationClient), {
            migrationsFolder: 'db/migrations',
        });
        await migrationClient.end();
    });

    // Before each test, connect and clean the tables, then seed data
    beforeEach(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        client = postgres(process.env.DATABASE_URL_TEST);
        db = drizzle(client, { schema });

        // Clean up tables in reverse order of dependencies
        await db.delete(schema.documentHistory);
        await db.delete(schema.documents);
        await db.delete(schema.areaHierarchy);
        await db.delete(schema.users);
        await db.delete(schema.rolePermissions); // Clean role permissions before roles
        await db.delete(schema.roles);
        await db.delete(schema.permissions); // Clean permissions before organizations
        await db.delete(schema.organizations);
        await db.delete(schema.documentSequences);

        // Register repositories
        container.clearInstances();
        container.register(InjectionTokens.DB, { useValue: db });
        container.register(InjectionTokens.RoleRepository, { useClass: DrizzleRoleRepository });
        container.register(InjectionTokens.PermissionRepository, { useClass: DrizzlePermissionRepository });

        roleRepository = container.resolve(InjectionTokens.RoleRepository);
        permissionRepository = container.resolve(InjectionTokens.PermissionRepository);

        // Seed organizations
        [org1] = await db.insert(schema.organizations).values({ id: randomUUID(), name: 'Org Test 1', code: 'OT1' }).returning();
        [org2] = await db.insert(schema.organizations).values({ id: randomUUID(), name: 'Org Test 2', code: 'OT2' }).returning();

        // Seed all available permissions
        allPermissions = await permissionRepository.findAll();
        await db.insert(schema.permissions).values(allPermissions);
    });

    it('should create a new role with permissions', async () => {
        const roleName = 'Custom Role';
        const permissionIds = [allPermissions[0].id, allPermissions[1].id];

        const newRole = await roleRepository.create({
            name: roleName,
            organizationId: org1.id,
            permissionIds: permissionIds,
        });

        expect(newRole).toBeDefined();
        expect(newRole.name).toBe(roleName);
        expect(newRole.organizationId).toBe(org1.id);
        expect(newRole.isSystemRole).toBe(false);
        expect(newRole.permissions).toHaveLength(permissionIds.length);
        expect(newRole.permissions.map((p) => p.id)).toEqual(expect.arrayContaining(permissionIds));

        // Verify in DB
        const roleInDb = await roleRepository.findById(newRole.id, org1.id);
        expect(roleInDb).toBeDefined();
        expect(roleInDb?.permissions.map((p) => p.id)).toEqual(expect.arrayContaining(permissionIds));
    });

    it('should not create a role with a duplicate name within the same organization', async () => {
        const roleName = 'Duplicate Role';
        await roleRepository.create({ name: roleName, organizationId: org1.id, permissionIds: [] });

        await expect(
            roleRepository.create({ name: roleName, organizationId: org1.id, permissionIds: [] }),
        ).rejects.toThrow(/duplicate key value violates unique constraint "idx_roles_organization_id_name"/i);
    });

    it('should allow creating roles with the same name in different organizations (multi-tenancy)', async () => {
        const roleName = 'Common Role Name';
        const role1 = await roleRepository.create({ name: roleName, organizationId: org1.id, permissionIds: [] });
        const role2 = await roleRepository.create({ name: roleName, organizationId: org2.id, permissionIds: [] });

        expect(role1).toBeDefined();
        expect(role2).toBeDefined();
        expect(role1.id).not.toBe(role2.id);
        expect(role1.name).toBe(roleName);
        expect(role2.name).toBe(roleName);
    });

    it('should find a role by ID and organizationId', async () => {
        const newRole = await roleRepository.create({ name: 'Find Me', organizationId: org1.id, permissionIds: [] });
        const foundRole = await roleRepository.findById(newRole.id, org1.id);

        expect(foundRole).toBeDefined();
        expect(foundRole?.id).toBe(newRole.id);
        expect(foundRole?.organizationId).toBe(org1.id);
    });

    it('should return null when finding a role by ID from another organization (multi-tenancy)', async () => {
        const newRoleOrg1 = await roleRepository.create({ name: 'Org1 Role', organizationId: org1.id, permissionIds: [] });
        const foundRole = await roleRepository.findById(newRoleOrg1.id, org2.id); // Try to find Org1 role in Org2

        expect(foundRole).toBeNull();
    });

    it('should find a role by name and organizationId', async () => {
        const roleName = 'Find By Name';
        await roleRepository.create({ name: roleName, organizationId: org1.id, permissionIds: [] });
        const foundRole = await roleRepository.findByName(roleName, org1.id);

        expect(foundRole).toBeDefined();
        expect(foundRole?.name).toBe(roleName);
        expect(foundRole?.organizationId).toBe(org1.id);
    });

    it('should return null when finding a role by name from another organization (multi-tenancy)', async () => {
        const roleName = 'Org1 Role Name';
        await roleRepository.create({ name: roleName, organizationId: org1.id, permissionIds: [] });
        const foundRole = await roleRepository.findByName(roleName, org2.id); // Try to find Org1 role in Org2

        expect(foundRole).toBeNull();
    });

    it('should list all roles for a given organization, including permissions', async () => {
        const role1 = await roleRepository.create({ name: 'Role 1 Org1', organizationId: org1.id, permissionIds: [allPermissions[0].id] });
        const role2 = await roleRepository.create({ name: 'Role 2 Org1', organizationId: org1.id, permissionIds: [allPermissions[1].id, allPermissions[2].id] });
        await roleRepository.create({ name: 'Role 1 Org2', organizationId: org2.id, permissionIds: [] }); // Role in another org

        const rolesOrg1 = await roleRepository.findManyByOrganizationId(org1.id);

        expect(rolesOrg1).toHaveLength(2);
        expect(rolesOrg1.map((r) => r.name)).toEqual(expect.arrayContaining(['Role 1 Org1', 'Role 2 Org1']));
        expect(rolesOrg1.some((r) => r.organizationId === org2.id)).toBeFalsy(); // Multi-tenancy check

        const foundRole1 = rolesOrg1.find((r) => r.id === role1.id);
        expect(foundRole1?.permissions).toHaveLength(1);
        expect(foundRole1?.permissions[0].id).toBe(allPermissions[0].id);

        const foundRole2 = rolesOrg1.find((r) => r.id === role2.id);
        expect(foundRole2?.permissions).toHaveLength(2);
        expect(foundRole2?.permissions.map((p) => p.id)).toEqual(expect.arrayContaining([allPermissions[1].id, allPermissions[2].id]));
    });

    it('should update a role name and its permissions', async () => {
        const roleToUpdate = await roleRepository.create({ name: 'Old Name', organizationId: org1.id, permissionIds: [allPermissions[0].id] });
        const updatedName = 'New Name';
        const newPermissionIds = [allPermissions[1].id, allPermissions[2].id];

        const updatedRole = await roleRepository.update(roleToUpdate.id, org1.id, {
            name: updatedName,
            permissionIds: newPermissionIds,
        });

        expect(updatedRole).toBeDefined();
        expect(updatedRole?.name).toBe(updatedName);
        expect(updatedRole?.permissions).toHaveLength(newPermissionIds.length);
        expect(updatedRole?.permissions.map((p) => p.id)).toEqual(expect.arrayContaining(newPermissionIds));

        // Verify in DB
        const roleInDb = await roleRepository.findById(roleToUpdate.id, org1.id);
        expect(roleInDb?.name).toBe(updatedName);
        expect(roleInDb?.permissions.map((p) => p.id)).toEqual(expect.arrayContaining(newPermissionIds));
    });

    it('should return null when updating a non-existent role in the organization', async () => {
        const updatedRole = await roleRepository.update(randomUUID(), org1.id, { name: 'Non Existent' });
        expect(updatedRole).toBeNull();
    });

    it('should return null when updating a role from another organization (multi-tenancy)', async () => {
        const roleOrg1 = await roleRepository.create({ name: 'Org1 Role', organizationId: org1.id, permissionIds: [] });
        const updatedRole = await roleRepository.update(roleOrg1.id, org2.id, { name: 'Attempted Change' });
        expect(updatedRole).toBeNull();

        // Verify no change in original role
        const originalRole = await roleRepository.findById(roleOrg1.id, org1.id);
        expect(originalRole?.name).toBe('Org1 Role');
    });

    it('should delete a role and its associated permissions', async () => {
        const roleToDelete = await roleRepository.create({ name: 'Delete Me', organizationId: org1.id, permissionIds: [allPermissions[0].id] });

        await roleRepository.delete(roleToDelete.id, org1.id);

        // Verify role is deleted
        const roleInDb = await roleRepository.findById(roleToDelete.id, org1.id);
        expect(roleInDb).toBeNull();

        // Verify associated permissions are also deleted (from rolePermissions table)
        const rolePermissionsInDb = await db.query.rolePermissions.findMany({
            where: eq(schema.rolePermissions.roleId, roleToDelete.id),
        });
        expect(rolePermissionsInDb).toHaveLength(0);
    });

    it('should not delete a role from another organization (multi-tenancy)', async () => {
        const roleOrg1 = await roleRepository.create({ name: 'Org1 Role', organizationId: org1.id, permissionIds: [] });
        await roleRepository.delete(roleOrg1.id, org2.id); // Try to delete Org1 role from Org2

        // Verify role still exists in Org1
        const roleInDb = await roleRepository.findById(roleOrg1.id, org1.id);
        expect(roleInDb).toBeDefined();
    });

    it('should throw an error if trying to delete a role with assigned users', async () => {
        const roleWithUsers = await roleRepository.create({ name: 'Role With Users', organizationId: org1.id, permissionIds: [] });
        // Assign a user to this role
        await db.insert(schema.users).values({
            id: randomUUID(),
            name: 'Test User',
            email: 'test@user.com',
            organizationId: org1.id,
            roleId: roleWithUsers.id,
            hashedPassword: 'hashed_password_placeholder',
        });

        await expect(
            roleRepository.delete(roleWithUsers.id, org1.id),
        ).rejects.toThrow(/violates foreign key constraint "roles_role_id_fk"/i); // PostgreSQL error for FK restrict
    });

    it('should count users with a specific role', async () => {
        const role1 = await roleRepository.create({ name: 'Role 1', organizationId: org1.id, permissionIds: [] });
        const role2 = await roleRepository.create({ name: 'Role 2', organizationId: org1.id, permissionIds: [] });

        // Assign users to role1
        await db.insert(schema.users).values([
            { id: randomUUID(), name: 'User A', email: 'userA@org1.com', organizationId: org1.id, roleId: role1.id, hashedPassword: 'hp' },
            { id: randomUUID(), name: 'User B', email: 'userB@org1.com', organizationId: org1.id, roleId: role1.id, hashedPassword: 'hp' },
        ]);
        // Assign a user to role2
        await db.insert(schema.users).values([
            { id: randomUUID(), name: 'User C', email: 'userC@org1.com', organizationId: org1.id, roleId: role2.id, hashedPassword: 'hp' },
        ]);

        const countRole1 = await roleRepository.countUsersWithRole(role1.id);
        const countRole2 = await roleRepository.countUsersWithRole(role2.id);
        const countNonExistentRole = await roleRepository.countUsersWithRole(randomUUID());

        expect(countRole1).toBe(2);
        expect(countRole2).toBe(1);
        expect(countNonExistentRole).toBe(0);
    });

    it('should get permissions by role ID', async () => {
        const permissionIds = [allPermissions[0].id, allPermissions[1].id];
        const newRole = await roleRepository.create({ name: 'Role with Perms', organizationId: org1.id, permissionIds: permissionIds });

        const fetchedPermissions = await roleRepository.getPermissionsByRoleId(newRole.id);

        expect(fetchedPermissions).toHaveLength(permissionIds.length);
        expect(fetchedPermissions.map((p) => p.id)).toEqual(expect.arrayContaining(permissionIds));
    });

    it('should add permissions to a role', async () => {
        const newRole = await roleRepository.create({ name: 'Role to Add Perms', organizationId: org1.id, permissionIds: [allPermissions[0].id] });
        const permissionsToAdd = [allPermissions[1].id, allPermissions[2].id];

        await roleRepository.addPermissionsToRole(newRole.id, permissionsToAdd);

        const updatedRole = await roleRepository.findById(newRole.id, org1.id);
        expect(updatedRole?.permissions).toHaveLength(3); // Original + 2 new
        expect(updatedRole?.permissions.map((p) => p.id)).toEqual(expect.arrayContaining([allPermissions[0].id, allPermissions[1].id, allPermissions[2].id]));
    });

    it('should remove permissions from a role', async () => {
        const newRole = await roleRepository.create({ name: 'Role to Remove Perms', organizationId: org1.id, permissionIds: [allPermissions[0].id, allPermissions[1].id, allPermissions[2].id] });
        const permissionsToRemove = [allPermissions[0].id, allPermissions[2].id];

        await roleRepository.removePermissionsFromRole(newRole.id, permissionsToRemove);

        const updatedRole = await roleRepository.findById(newRole.id, org1.id);
        expect(updatedRole?.permissions).toHaveLength(1); // Only allPermissions[1] should remain
        expect(updatedRole?.permissions[0].id).toBe(allPermissions[1].id);
    });

    it('should handle adding and removing no permissions gracefully', async () => {
        const newRole = await roleRepository.create({ name: 'Role No Perms', organizationId: org1.id, permissionIds: [allPermissions[0].id] });

        await roleRepository.addPermissionsToRole(newRole.id, []);
        let updatedRole = await roleRepository.findById(newRole.id, org1.id);
        expect(updatedRole?.permissions).toHaveLength(1);

        await roleRepository.removePermissionsFromRole(newRole.id, []);
        updatedRole = await roleRepository.findById(newRole.id, org1.id);
        expect(updatedRole?.permissions).toHaveLength(1);
    });
});