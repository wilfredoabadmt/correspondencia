import { inject, injectable } from 'tsyringe';
import { and, count, desc, eq, getTableColumns, ilike, or, SQL } from 'drizzle-orm';

import type { DB } from '@/core/db/db.di';
import * as schema from '@/db/schema';
import type {
    Document,
    DocumentWithArea,
    FindManyDocumentsParams,
    DeriveParams,
    IDocumentRepository,
    PaginatedResult,
} from '../core/document.repository';
import { InjectionTokens } from '~/core/injection-tokens';

@injectable()
export class DrizzleDocumentRepository implements IDocumentRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    async findDetailsById({
        id,
        organizationId,
    }: {
        id: string;
        organizationId: string;
    }): Promise<DocumentWithArea | null> {
        const documentColumns = getTableColumns(schema.documents);
        const result = await this.db
            .select({
                ...documentColumns,
                destinationAreaName: schema.areaHierarchy.name,
            })
            .from(schema.documents)
            .leftJoin(
                schema.areaHierarchy,
                eq(schema.documents.destinationAreaId, schema.areaHierarchy.id)
            )
            .where(
                and(eq(schema.documents.id, id), eq(schema.documents.organizationId, organizationId))
            )
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return result[0];
    }

    async findMany({
        organizationId,
        page,
        pageSize,
        query,
        status,
    }: FindManyDocumentsParams): Promise<PaginatedResult<Document>> {
        const conditions: (SQL | undefined)[] = [
            eq(schema.documents.organizationId, organizationId),
        ];

        if (status) {
            conditions.push(eq(schema.documents.status, status as any));
        }

        if (query) {
            conditions.push(
                or(
                    ilike(schema.documents.trackingId, `%${query}%`),
                    ilike(schema.documents.subject, `%${query}%`)
                )
            );
        }

        const finalConditions = and(...conditions.filter((c): c is SQL => !!c));

        const [totalResult, data] = await this.db.transaction(async (tx) => {
            const totalQuery = tx
                .select({ value: count() })
                .from(schema.documents)
                .where(finalConditions);

            const dataQuery = tx
                .select()
                .from(schema.documents)
                .where(finalConditions)
                .orderBy(desc(schema.documents.receptionDate))
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            return Promise.all([totalQuery, dataQuery]);
        });

        const total = totalResult[0]?.value ?? 0;

        return { data, total };
    }

    async derive({
        documentId,
        fromAreaId,
        toAreaId,
        userId,
        comment,
    }: DeriveParams): Promise<void> {
        await this.db.transaction(async (tx) => {
            // 1. Update the document's status and destination area
            await tx
                .update(schema.documents)
                .set({ status: 'En Proceso', destinationAreaId: toAreaId })
                .where(eq(schema.documents.id, documentId));

            // 2. Create a record in the history table
            await tx.insert(schema.documentHistory).values({ documentId, fromAreaId, toAreaId, userId, comment });
        });
    }

    // Placeholder for other methods of the interface
    async create(data: typeof schema.documents.$inferInsert): Promise<any> {
        const [newInstance] = await this.db.insert(schema.documents).values(data).returning();
        return newInstance;
    }
}