import 'reflect-metadata';
import { and, eq } from 'drizzle-orm';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { container, InjectionTokens } from '~/core/container';
import * as schema from '~/db/schema';
import { IRegisterDocumentUseCase } from './register-document.use-case';
import { randomUUID } from 'crypto';
import { DocumentType } from '../core/document.entity';

// This test requires a running PostgreSQL database configured via DATABASE_URL_TEST
describe('RegisterDocumentUseCase - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client;

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

    // Before each test, connect and clean the tables
    beforeEach(async () => {
        if (!process.env.DATABASE_URL_TEST) {
            throw new Error('DATABASE_URL_TEST is not set for integration tests');
        }
        client = postgres(process.env.DATABASE_URL_TEST);
        db = drizzle(client, { schema });

        // Clean up tables in reverse order of dependencies
        await db.delete(schema.documents);
        await db.delete(schema.documentSequences);
        await db.delete(schema.areaHierarchies);
        await db.delete(schema.organizations);
    });

    it('should register a new document, create a sequence, and save it to the database', async () => {
        // 1. Setup
        const useCase = container.resolve<IRegisterDocumentUseCase>(
            InjectionTokens.RegisterDocumentUseCase
        );

        // Seed necessary data
        const [org] = await db
            .insert(schema.organizations)
            .values({ name: 'Test Org' })
            .returning();
        const [area] = await db
            .insert(schema.areaHierarchies)
            .values({
                organizationId: org.id,
                code: 'TEST/AREA',
                name: 'Test Area',
            })
            .returning();

        const input = {
            organizationId: org.id,
            userId: randomUUID(),
            documentType: DocumentType.NOTA_INTERNA,
            areaHierarchyId: area.id,
            subject: 'Integration Test Subject',
            sender: 'Integration Test Sender',
            receptionDate: new Date('2024-01-10T10:00:00Z'),
        };

        // 2. Execute
        const result = await useCase.execute(input);

        // 3. Assert
        expect(result).toBeDefined();
        expect(result.id).toBeTypeOf('string');
        expect(result.trackingCode).toBe('NI/TEST/AREA/00001-2024');

        // Verify data in the database
        const savedDocument = await db
            .select()
            .from(schema.documents)
            .where(eq(schema.documents.id, result.id));
        expect(savedDocument).toHaveLength(1);
        expect(savedDocument[0].trackingCode).toBe('NI/TEST/AREA/00001-2024');

        // Execute a second time to test sequence increment
        const result2 = await useCase.execute(input);
        expect(result2.trackingCode).toBe('NI/TEST/AREA/00002-2024');
    });
});