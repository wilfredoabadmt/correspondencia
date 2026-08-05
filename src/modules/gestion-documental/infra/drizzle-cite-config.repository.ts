import { inject, injectable } from 'tsyringe';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { DB } from '@/core/db/db.di';
import * as schema from '@/db/schema';
import type {
    CiteConfig,
    FindCiteConfigParams,
    ICiteConfigRepository,
    UpsertCiteConfigParams,
} from '../core/cite-config.repository';
import { InjectionTokens } from '~/core/injection-tokens';

@injectable()
export class DrizzleCiteConfigRepository implements ICiteConfigRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    async findByParams({
        organizationId,
        areaId,
        documentType,
        year,
    }: FindCiteConfigParams): Promise<CiteConfig | null> {
        // Priority 1: Exact match on Area + DocumentType + Year
        // Priority 2: Match on Area + Year
        // Priority 3: Match on DocumentType + Year
        // Priority 4: Organization default for Year
        const conditions = [
            eq(schema.citeConfigs.organizationId, organizationId),
            eq(schema.citeConfigs.year, year),
        ];

        if (areaId) {
            conditions.push(eq(schema.citeConfigs.areaId, areaId));
        } else {
            conditions.push(isNull(schema.citeConfigs.areaId));
        }

        if (documentType) {
            conditions.push(eq(schema.citeConfigs.documentType, documentType));
        } else {
            conditions.push(isNull(schema.citeConfigs.documentType));
        }

        const [config] = await this.db
            .select()
            .from(schema.citeConfigs)
            .where(and(...conditions))
            .limit(1);

        if (config) return config;

        // Fallback: search for Organization level rule for the year
        const [fallback] = await this.db
            .select()
            .from(schema.citeConfigs)
            .where(
                and(
                    eq(schema.citeConfigs.organizationId, organizationId),
                    eq(schema.citeConfigs.year, year),
                    isNull(schema.citeConfigs.areaId),
                    isNull(schema.citeConfigs.documentType)
                )
            )
            .limit(1);

        return fallback || null;
    }

    async listByOrganization(organizationId: string): Promise<CiteConfig[]> {
        return await this.db
            .select()
            .from(schema.citeConfigs)
            .where(eq(schema.citeConfigs.organizationId, organizationId))
            .orderBy(desc(schema.citeConfigs.year), desc(schema.citeConfigs.createdAt));
    }

    async upsert(params: UpsertCiteConfigParams): Promise<CiteConfig> {
        if (params.id) {
            const [updated] = await this.db
                .update(schema.citeConfigs)
                .set({
                    formatPattern: params.formatPattern,
                    currentSequence: params.currentSequence ?? 0,
                    resetYearly: params.resetYearly ?? true,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(schema.citeConfigs.id, params.id),
                        eq(schema.citeConfigs.organizationId, params.organizationId)
                    )
                )
                .returning();

            return updated;
        }

        const [created] = await this.db
            .insert(schema.citeConfigs)
            .values({
                organizationId: params.organizationId,
                areaId: params.areaId || null,
                documentType: params.documentType || null,
                formatPattern: params.formatPattern,
                currentSequence: params.currentSequence ?? 0,
                year: params.year,
                resetYearly: params.resetYearly ?? true,
            })
            .returning();

        return created;
    }

    async incrementSequence(id: string): Promise<number> {
        const [updated] = await this.db
            .update(schema.citeConfigs)
            .set({
                currentSequence: sql`${schema.citeConfigs.currentSequence} + 1`,
                updatedAt: new Date(),
            })
            .where(eq(schema.citeConfigs.id, id))
            .returning({ nextSeq: schema.citeConfigs.currentSequence });

        return updated.nextSeq;
    }
}
