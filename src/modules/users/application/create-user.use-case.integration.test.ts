import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

import * as schema from '~/db/schema';
import { InjectionTokens } from '~/core/injection-tokens';
import { CreateUserUseCase } from './create-user.use-case';
import { DrizzleUserRepository } from '../infra/drizzle-user.repository';
import { IUserRepository } from '../core/user.repository';

// This test requires a running PostgreSQL database configured via DATABASE_URL_TEST
describe('CreateUserUseCase - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client: postgres.Sql;
    let createUserUseCase: CreateUserUseCase;
    let userRepository: IUserRepository; // To directly query/insert for setup/verification

    // Test data
    let org1: typeof schema.organizations.$inferSelect;
    let org2: typeof schema.organizations.$inferSelect;
    let adminUserOrg1: typeof schema.users.$inferSelect;
    let operatorUserOrg1: typeof schema.users.$inferSelect;

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
        container.register(InjectionTokens.CreateUserUseCase, {
            useClass: CreateUserUseCase,
        });

        createUserUseCase = container.resolve(InjectionTokens.CreateUserUseCase);
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
    });

    it('should create a new user for an ADMIN in their organization', async () => {
        const newUserName = 'New User';
        const newUserEmail = 'newuser@test.com';
        const newUserRole = 'OPERADOR';

        const { user, temporaryPassword } = await createUserUseCase.execute({
            name: newUserName,
            email: newUserEmail,
            role: newUserRole,
            organizationId: org1.id,
            actingUserId: adminUserOrg1.id,
            actingUserRole: 'ADMINISTRADOR',
        });

        expect(user).toBeDefined();
        expect(user.name).toBe(newUserName);
        expect(user.email).toBe(newUserEmail);
        expect(user.organizationId).toBe(org1.id);
        expect(user.role).toBe(newUserRole);
        expect(temporaryPassword).toBeDefined();
        expect(user).not.toHaveProperty('hashedPassword'); // Should not return hashedPassword

        // Verify user exists in DB with hashed password
        const userInDb = await db.query.users.findFirst({
            where: eq(schema.users.id, user.id),
        });
        expect(userInDb).toBeDefined();
        expect(userInDb?.hashedPassword).toBeDefined();
        expect(await bcrypt.compare(temporaryPassword, userInDb!.hashedPassword!)).toBeTruthy();
    });

    it('should throw a Forbidden error if the acting user role is not ADMIN', async () => {
        await expect(
            createUserUseCase.execute({
                name: 'Unauthorized User',
                email: 'unauthorized@test.com',
                role: 'OPERADOR',
                organizationId: org1.id,
                actingUserId: operatorUserOrg1.id,
                actingUserRole: 'OPERADOR', // Unauthorized role
            }),
        ).rejects.toThrow("Forbidden: User with role 'OPERADOR' is not authorized to create users.");

        // Verify no user was created
        const usersInDb = await userRepository.findManyByOrganizationId(org1.id);
        expect(usersInDb).toHaveLength(2); // Only initial users
    });

    it('should throw a Validation Error if an user with the same email already exists in the organization', async () => {
        await expect(
            createUserUseCase.execute({
                name: 'Duplicate User',
                email: 'admin1@test.com', // Email already exists in Org 1
                role: 'OPERADOR',
                organizationId: org1.id,
                actingUserId: adminUserOrg1.id,
                actingUserRole: 'ADMINISTRADOR',
            }),
        ).rejects.toThrow('Validation Error: An user with this email already exists in this organization.');

        // Verify no new user was created
        const usersInDb = await userRepository.findManyByOrganizationId(org1.id);
        expect(usersInDb).toHaveLength(2); // Only initial users
    });

    it('should allow creating a user with an email that exists in a different organization', async () => {
        const newUserName = 'New User Org1';
        const newUserEmail = 'admin2@test.com'; // This email exists in Org 2
        const newUserRole = 'OPERADOR';

        const { user } = await createUserUseCase.execute({
            name: newUserName,
            email: newUserEmail,
            role: newUserRole,
            organizationId: org1.id, // Creating in Org 1
            actingUserId: adminUserOrg1.id,
            actingUserRole: 'ADMINISTRADOR',
        });

        expect(user).toBeDefined();
        expect(user.email).toBe(newUserEmail);
        expect(user.organizationId).toBe(org1.id);

        // Verify user exists in DB
        const userInDb = await db.query.users.findFirst({
            where: eq(schema.users.id, user.id),
        });
        expect(userInDb).toBeDefined();
    });

    it('should store the password as a hash in the database', async () => {
        const newUserName = 'Hashed User';
        const newUserEmail = 'hashed@test.com';
        const newUserRole = 'OPERADOR';

        const { user, temporaryPassword } = await createUserUseCase.execute({
            name: newUserName,
            email: newUserEmail,
            role: newUserRole,
            organizationId: org1.id,
            actingUserId: adminUserOrg1.id,
            actingUserRole: 'ADMINISTRADOR',
        });

        const userInDb = await db.query.users.findFirst({
            where: eq(schema.users.id, user.id),
        });

        expect(userInDb?.hashedPassword).toBeDefined();
        expect(userInDb?.hashedPassword).not.toBe(temporaryPassword); // Should be hashed
        expect(await bcrypt.compare(temporaryPassword, userInDb!.hashedPassword!)).toBeTruthy();
    });

    it('should propagate errors from the user repository', async () => {
        // Mock the repository's create method to throw an error
        userRepository.create = vi.fn().mockRejectedValue(new Error('Database error during creation'));

        await expect(
            createUserUseCase.execute({
                name: 'Error User',
                email: 'error@test.com',
                role: 'OPERADOR',
                organizationId: org1.id,
                actingUserId: adminUserOrg1.id,
                actingUserRole: 'ADMINISTRADOR',
            }),
        ).rejects.toThrow('Database error during creation');
    });
});