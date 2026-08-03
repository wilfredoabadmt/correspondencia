import { inject, injectable } from 'tsyringe';
import { and, count, desc, eq, gte } from 'drizzle-orm';

import type { DB } from '@/core/db/db.di';
import { InjectionTokens } from '~/core/injection-tokens';
import * as schema from '@/db/schema';
import type {
    DashboardKpis,
    IDashboardRepository,
    RecentDocument,
} from '../core/dashboard.repository';

@injectable()
export class DrizzleDashboardRepository implements IDashboardRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    async getKpis({ organizationId }: { organizationId: string }): Promise<DashboardKpis> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [documentsTodayResult, pendingDocumentsResult, totalDocumentsResult] = await Promise.all([
            this.db
                .select({ value: count() })
                .from(schema.documents)
                .where(
                    and(
                        eq(schema.documents.organizationId, organizationId),
                        gte(schema.documents.receptionDate, today)
                    )
                ),
            this.db
                .select({ value: count() })
                .from(schema.documents)
                .where(
                    and(
                        eq(schema.documents.organizationId, organizationId),
                        eq(schema.documents.status, 'Recibido')
                    )
                ),
            this.db
                .select({ value: count() })
                .from(schema.documents)
                .where(eq(schema.documents.organizationId, organizationId)),
        ]);

        const documentsToday = Number(documentsTodayResult[0]?.value ?? 0);
        const pendingDocuments = Number(pendingDocumentsResult[0]?.value ?? 0);
        const totalDocuments = Number(totalDocumentsResult[0]?.value ?? 0);

        return {
            documentsToday,
            pendingDocuments,
            totalDocuments,
        };
    }

    async getRecentDocuments(params: { organizationId: string; limit: number }): Promise<RecentDocument[]> {
        const results = await this.db
            .select({
                id: schema.documents.id,
                trackingId: schema.documents.trackingId,
                subject: schema.documents.subject,
                receptionDate: schema.documents.receptionDate,
            })
            .from(schema.documents)
            .where(eq(schema.documents.organizationId, params.organizationId))
            .orderBy(desc(schema.documents.receptionDate))
            .limit(params.limit);

        return results as RecentDocument[];
    }
}