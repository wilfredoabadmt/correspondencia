import { inject, injectable } from 'tsyringe';
import { eq, desc, and } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { DB } from '~/core/db/db.di';
import * as schema from '~/db/schema';
import type { HistoryEntry, IDocumentHistoryRepository, PaginatedHistory } from '../core/document-history.repository';
import { InjectionTokens } from '~/core/injection-tokens';

@injectable()
export class DrizzleDocumentHistoryRepository implements IDocumentHistoryRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    async findByDocumentId(documentId: string, organizationId: string = '', limit: number = 10, offset: number = 0): Promise<PaginatedHistory> {
        const fromArea = alias(schema.areaHierarchy, 'from_area');
        const toArea = alias(schema.areaHierarchy, 'to_area');

        let query = this.db
            .select({
                id: schema.documentHistory.id,
                documentId: schema.documentHistory.documentId,
                fromAreaId: schema.documentHistory.fromAreaId,
                toAreaId: schema.documentHistory.toAreaId,
                userId: schema.documentHistory.userId,
                comment: schema.documentHistory.comment,
                createdAt: schema.documentHistory.createdAt,
                fromAreaName: fromArea.name,
                toAreaName: toArea.name,
                userName: schema.users.name,
            })
            .from(schema.documentHistory)
            .leftJoin(fromArea, eq(schema.documentHistory.fromAreaId, fromArea.id))
            .leftJoin(toArea, eq(schema.documentHistory.toAreaId, toArea.id))
            .leftJoin(schema.users, eq(schema.documentHistory.userId, schema.users.id));

        const whereCondition = organizationId
            ? and(
                eq(schema.documentHistory.documentId, documentId),
                eq(schema.documents.organizationId, organizationId)
            )
            : eq(schema.documentHistory.documentId, documentId);

        if (organizationId) {
            query = query.innerJoin(schema.documents, eq(schema.documentHistory.documentId, schema.documents.id)) as any;
        }

        const rows = await query
            .where(whereCondition)
            .orderBy(desc(schema.documentHistory.createdAt))
            .limit(limit + 1)
            .offset(offset);

        const hasMore = rows.length > limit;
        const history: HistoryEntry[] = rows.slice(0, limit).map((row) => ({
            ...row,
            createdAt: row.createdAt ?? new Date(),
            toAreaName: row.toAreaName ?? 'Área desconocida',
        }));

        return { history, hasMore };
    }
}
