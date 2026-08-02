import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { container, InjectionTokens } from '~/core/container';
import * as schema from '~/db/schema';
import { ILoginUseCase } from './login.use-case';
import { hash } from 'bcryptjs';
import { AuthenticationError } from './login.use-case.impl';

describe('LoginUseCase - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client;
    let loginUseCase: ILoginUseCase;
    let org: typeof schema.organizations.$inferSelect;
    const plainPassword = 'password123';
    let hashedPassword = '';

    beforeAll(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        const migrationClient = postgres(process.env.DATABASE_URL_TEST, { max: 1 });
        await migrate(drizzle(migrationClient), {
            migrationsFolder: 'db/migrations',
        });
        await migrationClient.end();

        // Hash the password once for all tests
        hashedPassword = await hash(plainPassword, 10);
    });

    beforeEach(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        client = postgres(process.env.DATABASE_URL_TEST);
        db = drizzle(client, { schema });

        // Clean up tables
        await db.delete(schema.users);
        await db.delete(schema.organizations);

        // Resolve use case
        loginUseCase = container.resolve<ILoginUseCase>(InjectionTokens.LoginUseCase);

        // Seed a common organization
        [org] = await db
            .insert(schema.organizations)
            .values({ name: 'Login Test Org' })
            .returning();
    });

    it('should successfully log in a user with correct credentials', async () => {
        // 1. Setup: Create a user in the database
        await db.insert(schema.users).values({
            organizationId: org.id,
            email: 'test@example.com',
            hashedPassword: hashedPassword,
            role: 'OPERADOR',
        });

        // 2. Execute
        const result = await loginUseCase.execute({
            email: 'test@example.com',
            password: plainPassword,
            organizationId: org.id,
        });

        // 3. Assert
        expect(result).toBeDefined();
        expect(result.email).toBe('test@example.com');
        expect(result.role).toBe('OPERADOR');
        expect(result).not.toHaveProperty('hashedPassword');
    });

    it('should throw AuthenticationError for incorrect password', async () => {
        // 1. Setup: Create a user
        await db.insert(schema.users).values({
            organizationId: org.id,
            email: 'test@example.com',
            hashedPassword: hashedPassword,
            role: 'OPERADOR',
        });

        // 2. Execute & Assert
        await expect(
            loginUseCase.execute({
                email: 'test@example.com',
                password: 'wrongpassword',
                organizationId: org.id,
            })
        ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for non-existent user', async () => {
        // 2. Execute & Assert
        await expect(
            loginUseCase.execute({
                email: 'nouser@example.com',
                password: 'anypassword',
                organizationId: org.id,
            })
        ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for a user in a different organization', async () => {
        // 1. Setup: Create a user in the main org
        await db.insert(schema.users).values({
            organizationId: org.id,
            email: 'test@example.com',
            hashedPassword: hashedPassword,
            role: 'OPERADOR',
        });

        // Create a different org
        const [otherOrg] = await db
            .insert(schema.organizations)
            .values({ name: 'Other Org' })
            .returning();

        // 2. Execute & Assert: Try to log in to the other org with the first user's credentials
        await expect(
            loginUseCase.execute({
                email: 'test@example.com',
                password: plainPassword,
                organizationId: otherOrg.id,
            })
        ).rejects.toThrow(AuthenticationError);
    });
});