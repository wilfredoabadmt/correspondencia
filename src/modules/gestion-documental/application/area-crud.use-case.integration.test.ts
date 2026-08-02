import 'reflect-metadata';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { container, InjectionTokens } from '~/core/container';
import * as schema from '~/db/schema';
import { ICreateAreaUseCase } from './create-area.use-case';
import { IDeleteAreaUseCase } from './delete-area.use-case';
import { randomUUID } from 'crypto';
import { DocumentType } from '../core/document.entity';

describe('Area CRUD Use Cases - Integration Test', () => {
    let db: PostgresJsDatabase<typeof schema>;
    let client;
    let createAreaUseCase: ICreateAreaUseCase;
    let deleteAreaUseCase: IDeleteAreaUseCase;

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

        // Clean up tables in reverse order of dependencies
        await db.delete(schema.documents);
        await db.delete(schema.documentSequences);
        await db.delete(schema.areaHierarchies);
        await db.delete(schema.organizations);

        // Resolve use cases from the container
        createAreaUseCase = container.resolve<ICreateAreaUseCase>(
            InjectionTokens.CreateAreaUseCase
        );
        deleteAreaUseCase = container.resolve<IDeleteAreaUseCase>(
            InjectionTokens.DeleteAreaUseCase
        );
    });

    describe('CreateAreaUseCase', () => {
        it('should create a new area successfully', async () => {
            const [org] = await db
                .insert(schema.organizations)
                .values({ name: 'Org for Create Test' })
                .returning();

            const input = {
                organizationId: org.id,
                name: 'New Area',
                code: 'NEW-AREA',
            };

            const result = await createAreaUseCase.execute(input);

            expect(result).toBeDefined();
            expect(result.name).toBe('New Area');
            expect(result.code).toBe('NEW-AREA');
        });

        it('should throw an error when creating an area with a duplicate code', async () => {
            const [org] = await db
                .insert(schema.organizations)
                .values({ name: 'Org for Duplicate Test' })
                .returning();

            const input = {
                organizationId: org.id,
                name: 'First Area',
                code: 'DUP-CODE',
            };
            await createAreaUseCase.execute(input);

            const duplicateInput = {
                organizationId: org.id,
                name: 'Second Area',
                code: 'DUP-CODE',
            };

            await expect(createAreaUseCase.execute(duplicateInput)).rejects.toThrow(
                'Area with code "DUP-CODE" already exists in this organization.'
            );
        });
    });

    describe('DeleteAreaUseCase', () => {
        it('should delete an area successfully if it is not in use', async () => {
            const [org] = await db
                .insert(schema.organizations)
                .values({ name: 'Org for Delete Test' })
                .returning();
            const [area] = await db
                .insert(schema.areaHierarchies)
                .values({
                    organizationId: org.id,
                    name: 'Area to Delete',
                    code: 'DEL-ME',
                })
                .returning();

            await expect(
                deleteAreaUseCase.execute({ areaId: area.id, organizationId: org.id })
            ).resolves.toBeUndefined();
        });

        it('should throw an error when trying to delete an area that is in use', async () => {
            const [org] = await db
                .insert(schema.organizations)
                .values({ name: 'Org for In-Use Delete Test' })
                .returning();
            const [area] = await db
                .insert(schema.areaHierarchies)
                .values({
                    organizationId: org.id,
                    name: 'Area In Use',
                    code: 'IN-USE',
                })
                .returning();

            // Create a document that uses this area
            await db.insert(schema.documents).values({
                organizationId: org.id,
                areaHierarchyId: area.id,
                trackingCode: 'TEST/123',
                documentType: DocumentType.INFORME,
                subject: 'Test document',
                sender: 'Test sender',
                receptionDate: new Date(),
            });

            await expect(
                deleteAreaUseCase.execute({ areaId: area.id, organizationId: org.id })
            ).rejects.toThrow(
                'This area is in use by at least one document and cannot be deleted.'
            );
        });
    });
});