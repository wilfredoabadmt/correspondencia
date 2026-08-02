import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import * as schema from '~/db/schema';
import { POST as loginHandler } from '~/app/api/auth/login/route';
import { PUT as assignRoleHandler } from '~/app/api/users/[id]/role/route';
import { NextRequest } from 'next/server';
import { URL } from 'url';
import { hash } from 'bcryptjs';

describe('Auth API - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client;
    const plainPassword = 'password123';
    let hashedPassword = '';

    // Hardcoded IDs from API handlers for testing purposes
    const mockOrgId = 'e2a7a3d3-3e3a-4b3a-8e3a-3e3a4b3a8e3a';
    const mockAdminId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

    beforeAll(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        const migrationClient = postgres(process.env.DATABASE_URL_TEST, { max: 1 });
        await migrate(drizzle(migrationClient), {
            migrationsFolder: 'db/migrations',
        });
        await migrationClient.end();
        hashedPassword = await hash(plainPassword, 10);
    });

    beforeEach(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        client = postgres(process.env.DATABASE_URL_TEST);
        db = drizzle(client, { schema });

        await db.delete(schema.users);
        await db.delete(schema.organizations);

        // Seed the mock organization used in the handlers
        await db.insert(schema.organizations).values({ id: mockOrgId, name: 'Mock Org' });
    });

    describe('POST /api/auth/login', () => {
        it('should return 200 and set a session cookie on successful login', async () => {
            await db.insert(schema.users).values({
                organizationId: mockOrgId,
                email: 'user@test.com',
                hashedPassword,
                role: 'OPERADOR',
            });

            const request = new NextRequest(new URL('http://localhost/api/auth/login'), {
                method: 'POST',
                body: JSON.stringify({ email: 'user@test.com', password: plainPassword }),
            });

            const response = await loginHandler(request);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.email).toBe('user@test.com');
            expect(response.headers.get('Set-Cookie')).toContain('session_token=');
            expect(response.headers.get('Set-Cookie')).toContain('HttpOnly');
        });

        it('should return 401 for invalid credentials', async () => {
            const request = new NextRequest(new URL('http://localhost/api/auth/login'), {
                method: 'POST',
                body: JSON.stringify({ email: 'user@test.com', password: 'wrongpassword' }),
            });

            const response = await loginHandler(request);
            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/users/[id]/role', () => {
        it('should allow an admin to change a user role', async () => {
            // Seed the admin user with the hardcoded ID from the API handler
            await db.insert(schema.users).values({
                id: mockAdminId,
                organizationId: mockOrgId,
                email: 'hardcoded.admin@test.com',
                hashedPassword,
                role: 'ADMINISTRADOR',
            });

            const [operator] = await db.insert(schema.users).values({
                organizationId: mockOrgId,
                email: 'operator@test.com',
                hashedPassword,
                role: 'OPERADOR',
            }).returning();

            const request = new NextRequest(new URL(`http://localhost/api/users/${operator.id}/role`), {
                method: 'PUT',
                body: JSON.stringify({ role: 'ADMINISTRADOR' }),
            });

            const response = await assignRoleHandler(request, { params: { id: operator.id } });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.role).toBe('ADMINISTRADOR');
        });

        it('should return 404 if the target user does not exist', async () => {
            // Seed the admin user
            await db.insert(schema.users).values({
                id: mockAdminId,
                organizationId: mockOrgId,
                email: 'hardcoded.admin@test.com',
                hashedPassword,
                role: 'ADMINISTRADOR',
            });

            const nonExistentUserId = '00000000-0000-0000-0000-000000000000';
            const request = new NextRequest(new URL(`http://localhost/api/users/${nonExistentUserId}/role`), {
                method: 'PUT',
                body: JSON.stringify({ role: 'OPERADOR' }),
            });

            const response = await assignRoleHandler(request, { params: { id: nonExistentUserId } });
            expect(response.status).toBe(404);
        });
    });
});