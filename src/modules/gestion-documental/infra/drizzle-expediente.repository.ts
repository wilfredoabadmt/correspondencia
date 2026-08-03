import { inject, injectable } from 'tsyringe';
import { eq, and, ilike, sql, count } from 'drizzle-orm';
import { InjectionTokens } from '~/core/injection-tokens';
import type { DB } from '~/core/db/db.di';
import { expedientes, documents } from '~/db/schema';
import type {
    IExpedienteRepository,
    FindManyExpedientesParams,
    CreateExpedienteParams,
    UpdateExpedienteParams,
    PaginatedResult,
    ExpedienteDetail,
} from '../core/expediente.repository';
import type { ExpedienteWithDocumentCount } from '../core/expediente.entity';

@injectable()
export class DrizzleExpedienteRepository implements IExpedienteRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) {}

    async create(params: CreateExpedienteParams) {
        const [created] = await this.db
            .insert(expedientes)
            .values({
                code: params.code,
                subject: params.subject,
                organizationId: params.organizationId,
            })
            .returning();
        return created;
    }

    async findMany(params: FindManyExpedientesParams): Promise<PaginatedResult<ExpedienteWithDocumentCount>> {
        const { organizationId, page, pageSize, query, status } = params;
        const conditions = [eq(expedientes.organizationId, organizationId)];

        if (query) {
            conditions.push(
                sql`(${expedientes.code} ILIKE ${`%${query}%`} OR ${expedientes.subject} ILIKE ${`%${query}%`})`
            );
        }

        if (status) {
            conditions.push(eq(expedientes.status, status));
        }

        const whereClause = and(...conditions);

        const [countResult] = await this.db
            .select({ total: count() })
            .from(expedientes)
            .where(whereClause);

        const data = await this.db
            .select({
                id: expedientes.id,
                code: expedientes.code,
                subject: expedientes.subject,
                status: expedientes.status,
                organizationId: expedientes.organizationId,
                createdAt: expedientes.createdAt,
                updatedAt: expedientes.updatedAt,
                documentCount: count(documents.id),
            })
            .from(expedientes)
            .leftJoin(documents, eq(expedientes.id, documents.expedienteId))
            .where(whereClause)
            .groupBy(expedientes.id)
            .orderBy(expedientes.createdAt)
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        return {
            data: data as ExpedienteWithDocumentCount[],
            total: countResult?.total ?? 0,
        };
    }

    async findById(params: { id: string; organizationId: string }): Promise<ExpedienteDetail | null> {
        const [expediente] = await this.db
            .select()
            .from(expedientes)
            .where(
                and(
                    eq(expedientes.id, params.id),
                    eq(expedientes.organizationId, params.organizationId)
                )
            )
            .limit(1);

        if (!expediente) return null;

        const docs = await this.db
            .select({
                id: documents.id,
                subject: documents.subject,
                trackingCode: documents.trackingCode,
                status: documents.status,
                createdAt: documents.createdAt,
            })
            .from(documents)
            .where(eq(documents.expedienteId, params.id))
            .orderBy(documents.createdAt);

        return { ...expediente, documents: docs };
    }

    async findByCode(params: { code: string; organizationId: string }) {
        const [result] = await this.db
            .select()
            .from(expedientes)
            .where(
                and(
                    eq(expedientes.code, params.code),
                    eq(expedientes.organizationId, params.organizationId)
                )
            )
            .limit(1);

        return result ?? null;
    }

    async update(params: UpdateExpedienteParams) {
        const [updated] = await this.db
            .update(expedientes)
            .set({
                ...(params.subject !== undefined && { subject: params.subject }),
                ...(params.status !== undefined && { status: params.status }),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(expedientes.id, params.id),
                    eq(expedientes.organizationId, params.organizationId)
                )
            )
            .returning();

        return updated;
    }

    async associateDocument(params: { documentId: string; expedienteId: string; organizationId: string }) {
        await this.db
            .update(documents)
            .set({ expedienteId: params.expedienteId, updatedAt: new Date() })
            .where(
                and(
                    eq(documents.id, params.documentId),
                    eq(documents.organizationId, params.organizationId)
                )
            );
    }

    async disassociateDocument(params: { documentId: string; organizationId: string }) {
        await this.db
            .update(documents)
            .set({ expedienteId: null, updatedAt: new Date() })
            .where(
                and(
                    eq(documents.id, params.documentId),
                    eq(documents.organizationId, params.organizationId)
                )
            );
    }

    async searchForAssociation(params: { organizationId: string; query: string }) {
        return this.db
            .select()
            .from(expedientes)
            .where(
                and(
                    eq(expedientes.organizationId, params.organizationId),
                    sql`(${expedientes.code} ILIKE ${`%${params.query}%`} OR ${expedientes.subject} ILIKE ${`%${params.query}%`})`
                )
            )
            .orderBy(expedientes.createdAt)
            .limit(20);
    }
}
