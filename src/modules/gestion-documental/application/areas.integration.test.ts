import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import * as schema from '~/db/schema';
import { GET, POST } from '~/app/api/areas/route';
import { PUT, DELETE } from '~/app/api/areas/[id]/route';
import { NextRequest } from 'next/server';
import { URL } from 'url';
import { eq } from 'drizzle-orm';
import { DocumentType } from '~/modules/gestion-documental/core/document.entity';

describe('Areas API - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client;
    let org: typeof schema.organizations.$inferSelect;

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

    beforeEach(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        client = postgres(process.env.DATABASE_URL_TEST);
        db = drizzle(client, { schema });

        await db.delete(schema.documents);
        await db.delete(schema.documentSequences);
        await db.delete(schema.areaHierarchies);
        await db.delete(schema.organizations);

        // Seed a common organization for all tests
        [org] = await db
            .insert(schema.organizations)
            .values({ name: 'API Test Org' })
            .returning();
    });

    it('should handle the full CRUD lifecycle for areas via API endpoints', async () => {
        // 1. GET (empty) - List areas, should be empty initially
        let listRequest = new NextRequest(new URL('http://localhost/api/areas'));
        let listResponse = await GET(listRequest);
        let listBody = await listResponse.json();
        expect(listResponse.status).toBe(200);
        expect(listBody).toEqual([]);

        // 2. POST - Create a new area
        const createRequest = new NextRequest(new URL('http://localhost/api/areas'), {
            method: 'POST',
            body: JSON.stringify({ name: 'Finance', code: 'FIN' }),
        });
        const createResponse = await POST(createRequest);
        const createdArea = await createResponse.json();
        expect(createResponse.status).toBe(201);
        expect(createdArea.name).toBe('Finance');
        expect(createdArea.code).toBe('FIN');
        const areaId = createdArea.id;

        // 3. GET (with data) - List areas again, should contain the new area
        listResponse = await GET(listRequest);
        listBody = await listResponse.json();
        expect(listResponse.status).toBe(200);
        expect(listBody).toHaveLength(1);
        expect(listBody[0].name).toBe('Finance');

        // 4. PUT - Update the area
        const updateRequest = new NextRequest(
            new URL(`http://localhost/api/areas/${areaId}`),
            {
                method: 'PUT',
                body: JSON.stringify({ name: 'Finance Department', code: 'FIN-DEP' }),
            }
        );
        const updateResponse = await PUT(updateRequest, { params: { id: areaId } });
        const updatedArea = await updateResponse.json();
        expect(updateResponse.status).toBe(200);
        expect(updatedArea.name).toBe('Finance Department');
        expect(updatedArea.code).toBe('FIN-DEP');

        // 5. DELETE (fail) - Try to delete the area while it's in use
        await db.insert(schema.documents).values({
            organizationId: org.id,
            areaHierarchyId: areaId,
            trackingCode: 'TEST/456',
            documentType: DocumentType.INFORME,
            subject: 'Test doc',
            sender: 'Test sender',
            receptionDate: new Date(),
        });
        const deleteInUseRequest = new NextRequest(
            new URL(`http://localhost/api/areas/${areaId}`),
            { method: 'DELETE' }
        );
        const deleteInUseResponse = await DELETE(deleteInUseRequest, {
            params: { id: areaId },
        });
        expect(deleteInUseResponse.status).toBe(409); // Conflict

        // 6. DELETE (success) - Remove dependency and delete successfully
        await db.delete(schema.documents).where(eq(schema.documents.areaHierarchyId, areaId));
        const deleteRequest = new NextRequest(new URL(`http://localhost/api/areas/${areaId}`), {
            method: 'DELETE',
        });
        const deleteResponse = await DELETE(deleteRequest, { params: { id: areaId } });
        expect(deleteResponse.status).toBe(204);

        // Verify it's gone from the DB
        const found = await db.query.areaHierarchies.findFirst({
            where: eq(schema.areaHierarchies.id, areaId),
        });
        expect(found).toBeUndefined();
    });
});