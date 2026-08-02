import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';

import * as schema from '~/db/schema';
import { InjectionTokens } from '~/core/injection-tokens';
import { ListUsersUseCase } from './list-users.use-case';
import { DrizzleUserRepository } from '../infra/drizzle-user.repository';
import { IUserRepository } from '../core/user.repository';

// This test requires a running PostgreSQL database configured via DATABASE_URL_TEST
describe('ListUsersUseCase - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client: postgres.Sql;
    let listUsersUseCase: ListUsersUseCase;
    let userRepository: IUserRepository;

    // Test data
    let org1: typeof schema.organizations.$inferSelect;
    let org2: typeof schema.organizations.$inferSelect;
    let adminUserOrg1: typeof schema.users.$inferSelect;
    let operatorUserOrg1: typeof schema.users.$inferSelect;
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
        container.register(InjectionTokens.ListUsersUseCase, {
            useClass: ListUsersUseCase,
        });

        listUsersUseCase = container.resolve(InjectionTokens.ListUsersUseCase);
        userRepository = container.resolve(InjectionTokens.UserRepository); // To directly insert users

        // Seed organizations
        [org1] = await db.insert(schema.organizations).values({ id: randomUUID(), name: 'Org Test 1', code: 'OT1' }).returning();
        [org2] = await db.insert(schema.organizations).values({ id: randomUUID(), name: 'Org Test 2', code: 'OT2' }).returning();

        // Seed users for Org 1
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

    it('should list users for an ADMIN in their organization', async () => {
        const result = await listUsersUseCase.execute({
            organizationId: org1.id,
            userId: adminUserOrg1.id,
            userRole: 'ADMINISTRADOR',
        });

        expect(result).toHaveLength(2);
        expect(result.map((u) => u.email)).toEqual(
            expect.arrayContaining(['admin1@test.com', 'operator1@test.com']),
        );
        expect(result.some((u) => u.email === 'admin2@test.com')).toBeFalsy(); // Multi-tenancy check
    });

    it('should throw a Forbidden error if the user role is not ADMIN', async () => {
        await expect(
            listUsersUseCase.execute({
                organizationId: org1.id,
                userId: operatorUserOrg1.id,
                userRole: 'OPERADOR', // Unauthorized role
            }),
        ).rejects.toThrow("Forbidden: User with role 'OPERADOR' is not authorized to list users.");
    });

    it('should return an empty array if no users exist in the organization', async () => {
        const orgEmptyId = randomUUID();
        await db.insert(schema.organizations).values({ id: orgEmptyId, name: 'Org Empty', code: 'OE' });

        const result = await listUsersUseCase.execute({
            organizationId: orgEmptyId,
            userId: adminUserOrg1.id, // User ID doesn't matter for empty org, but role does
            userRole: 'ADMINISTRADOR',
        });

        expect(result).toHaveLength(0);
    });

    it('should not return hashedPassword in the user objects', async () => {
        const result = await listUsersUseCase.execute({
            organizationId: org1.id,
            userId: adminUserOrg1.id,
            userRole: 'ADMINISTRADOR',
        });

        expect(result).toHaveLength(2);
        expect(result[0]).not.toHaveProperty('hashedPassword');
        expect(result[1]).not.toHaveProperty('hashedPassword');
    });
});