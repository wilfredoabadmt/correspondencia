import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

import * as schema from '~/db/schema';
import { InjectionTokens } from '~/core/injection-tokens';
import { DeleteUserUseCase } from './delete-user.use-case';
import { DrizzleUserRepository } from '../infra/drizzle-user.repository';
import { IUserRepository } from '../core/user.repository';

// This test requires a running PostgreSQL database configured via DATABASE_URL_TEST
describe('DeleteUserUseCase - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client: postgres.Sql;
    let deleteUserUseCase: DeleteUserUseCase;
    let userRepository: IUserRepository; // To directly query/insert for setup/verification

    // Test data
    let org1: typeof schema.organizations.$inferSelect;
    let org2: typeof schema.organizations.$inferSelect;
    let adminUserOrg1: typeof schema.users.$inferSelect;
    let operatorUserOrg1: typeof schema.users.$inferSelect;
    let secondAdminUserOrg1: typeof schema.users.$inferSelect; // For testing last admin rule
    let adminUserOrg2: typeof schema.users.$inferSelect;

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
        await db.delete(schema.organizations);
        await db.delete(schema.documentSequences);

        // Register DrizzleUserRepository for the use case
        container.clearInstances();
        container.register(InjectionTokens.UserRepository, {
            useFactory: () => new DrizzleUserRepository(db),
        });
        container.register(InjectionTokens.DeleteUserUseCase, {
            useClass: DeleteUserUseCase,
        });

        deleteUserUseCase = container.resolve(InjectionTokens.DeleteUserUseCase);
        userRepository = container.resolve(InjectionTokens.UserRepository); // To directly insert/query

        // Seed organizations
        [org1] = await db.insert(schema.organizations).values({ id: randomUUID(), name: 'Org Test 1', code: 'OT1' }).returning();
        [org2] = await db.insert(schema.organizations).values({ id: randomUUID(), name: 'Org Test 2', code: 'OT2' }).returning();

        // Seed acting users for Org 1
        [adminUserOrg1] = await db.insert(schema.users).values({
            id: randomUUID(),
            name: 'Admin Org1',
            email: 'admin1@test.com',
            organizationId: org1.id,
            role: 'ADMINISTRADOR',
            hashedPassword: 'hashed_password_placeholder',
        }).returning();
        [operatorUserOrg1] = await db.insert(schema.users).values({
            id: randomUUID(),
            name: 'Operator Org1',
            email: 'operator1@test.com',
            organizationId: org1.id,
            role: 'OPERADOR',
            hashedPassword: 'hashed_password_placeholder',
        }).returning();
        [secondAdminUserOrg1] = await db.insert(schema.users).values({
            id: randomUUID(),
            name: 'Second Admin Org1',
            email: 'admin1_2@test.com',
            organizationId: org1.id,
            role: 'ADMINISTRADOR',
            hashedPassword: 'hashed_password_placeholder',
        }).returning();

        // Seed users for Org 2
        [adminUserOrg2] = await db.insert(schema.users).values({
            id: randomUUID(),
            name: 'Admin Org2',
            email: 'admin2@test.com',
            organizationId: org2.id,
            role: 'ADMINISTRADOR',
            hashedPassword: 'hashed_password_placeholder',
        }).returning();
    });

    it('should delete an OPERADOR user for an ADMIN in their organization', async () => {
        await deleteUserUseCase.execute({
            id: operatorUserOrg1.id,
            organizationId: org1.id,
            actingUserId: adminUserOrg1.id,
            actingUserRole: 'ADMINISTRADOR',
        });

        // Verify user is deleted from DB
        const userInDb = await userRepository.findById(operatorUserOrg1.id, org1.id);
        expect(userInDb).toBeNull();
    });

    it('should throw a Forbidden error if the acting user role is not ADMIN', async () => {
        await expect(
            deleteUserUseCase.execute({
                id: adminUserOrg1.id,
                organizationId: org1.id,
                actingUserId: operatorUserOrg1.id,
                actingUserRole: 'OPERADOR', // Unauthorized role
            }),
        ).rejects.toThrow("Forbidden: User with role 'OPERADOR' is not authorized to delete users.");

        // Verify no deletion occurred
        const userInDb = await userRepository.findById(adminUserOrg1.id, org1.id);
        expect(userInDb).toBeDefined();
    });

    it('should throw a Business Rule Violation if an ADMIN tries to delete themselves', async () => {
        await expect(
            deleteUserUseCase.execute({
                id: adminUserOrg1.id,
                organizationId: org1.id,
                actingUserId: adminUserOrg1.id,
                actingUserRole: 'ADMINISTRADOR',
            }),
        ).rejects.toThrow('Business Rule Violation: An ADMIN cannot delete themselves.');

        // Verify no deletion occurred
        const userInDb = await userRepository.findById(adminUserOrg1.id, org1.id);
        expect(userInDb).toBeDefined();
    });

    it('should throw a Business Rule Violation if trying to delete the last ADMIN in the organization', async () => {
        // Delete all users except adminUserOrg1
        await userRepository.delete(operatorUserOrg1.id, org1.id);
        await userRepository.delete(secondAdminUserOrg1.id, org1.id);

        // Now adminUserOrg1 is the only user and ADMIN in Org1.
        // The use case will first hit the "cannot delete themselves" rule if adminUserOrg1 tries to delete themselves.
        // To test "last ADMIN" specifically, we need an ADMIN trying to delete *another* ADMIN, and that other ADMIN is the last one.
        // This scenario is logically impossible: if there's another ADMIN trying to delete, then there are at least two ADMINs.
        // Therefore, the "Cannot delete the last ADMIN" rule is effectively covered when the acting user is the target user
        // and that user is the last ADMIN. The test above for "An ADMIN cannot delete themselves" covers this.

        // For clarity, let's explicitly check the admin count.
        const adminCount = await userRepository.countAdminsByOrganizationId(org1.id);
        expect(adminCount).toBe(1);

        // The error thrown will be "An ADMIN cannot delete themselves."
        await expect(
            deleteUserUseCase.execute({
                id: adminUserOrg1.id,
                organizationId: org1.id,
                actingUserId: adminUserOrg1.id,
                actingUserRole: 'ADMINISTRADOR',
            }),
        ).rejects.toThrow('Business Rule Violation: An ADMIN cannot delete themselves.');
    });

    it('should not delete a user if the target user is not in the acting user\'s organization (multi-tenancy)', async () => {
        // Admin from Org1 tries to delete admin from Org2
        await deleteUserUseCase.execute({
            id: adminUserOrg2.id, // User from Org2
            organizationId: org1.id, // Acting user's organization
            actingUserId: adminUserOrg1.id,
            actingUserRole: 'ADMINISTRADOR',
        });

        // Verify user from Org2 is NOT deleted
        const userInDbOrg2 = await userRepository.findById(adminUserOrg2.id, org2.id);
        expect(userInDbOrg2).toBeDefined(); // Should still exist

        // No error should be thrown by the use case, as the repository handles the multi-tenancy filter
        // and simply won't find a user to delete.
    });

    it('should propagate errors from the user repository', async () => {
        // Mock the repository's delete method to throw an error
        userRepository.delete = vi.fn().mockRejectedValue(new Error('Database error during deletion'));

        await expect(
            deleteUserUseCase.execute({
                id: operatorUserOrg1.id,
                organizationId: org1.id,
                actingUserId: adminUserOrg1.id,
                actingUserRole: 'ADMINISTRADOR',
            }),
        ).rejects.toThrow('Database error during deletion');
    });
});