import { inject, injectable } from 'tsyringe';
import { and, count, desc, eq, getTableColumns, ilike, or, SQL, sql } from 'drizzle-orm';

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
    }: FindManyDocumentsParams): Promise<PaginatedResult<DocumentWithArea>> {
        const conditions: (SQL | undefined)[] = [
            eq(schema.documents.organizationId, organizationId),
        ];

        if (status) {
            conditions.push(ilike(schema.documents.status, status));
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
        const documentColumns = getTableColumns(schema.documents);

        const [totalResult, data] = await this.db.transaction(async (tx) => {
            const totalQuery = tx
                .select({ value: count() })
                .from(schema.documents)
                .where(finalConditions);

            const dataQuery = tx
                .select({
                    ...documentColumns,
                    destinationAreaName: schema.areaHierarchy.name,
                })
                .from(schema.documents)
                .leftJoin(
                    schema.areaHierarchy,
                    eq(schema.documents.destinationAreaId, schema.areaHierarchy.id)
                )
                .where(finalConditions)
                .orderBy(desc(schema.documents.createdAt))
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            return Promise.all([totalQuery, dataQuery]);
        });

        const total = totalResult[0]?.value ?? 0;

        return { data: data as DocumentWithArea[], total };
    }

    async derive({
        documentId,
        fromAreaId,
        toAreaId,
        userId,
        comment,
        derivationType = 'OFICIAL',
        instructionCode,
        isUrgent = false,
    }: DeriveParams): Promise<void> {
        await this.db.transaction(async (tx) => {
            // 1. Update the document's status and destination area
            await tx
                .update(schema.documents)
                .set({ status: 'PENDIENTE_RECEPCION', destinationAreaId: toAreaId, currentUserId: null })
                .where(eq(schema.documents.id, documentId));

            // 2. Create a record in the history table
            await tx.insert(schema.documentHistory).values({
                documentId,
                fromAreaId,
                toAreaId,
                userId,
                fromUserId: userId,
                action: 'DERIVAR',
                receptionStatus: 'PENDIENTE_RECEPCION',
                comment,
                derivationType,
                instructionCode,
                isUrgent,
            });
        });
    }

    async receiveDocument({ documentId, userId, organizationId }: { documentId: string; userId: string; organizationId: string }): Promise<void> {
        await this.db.transaction(async (tx) => {
            const [doc] = await tx
                .select()
                .from(schema.documents)
                .where(and(eq(schema.documents.id, documentId), eq(schema.documents.organizationId, organizationId)));

            if (!doc) throw new Error('Documento no encontrado o sin acceso.');

            await tx
                .update(schema.documents)
                .set({ status: 'RECIBIDO', currentUserId: userId, updatedAt: new Date() })
                .where(eq(schema.documents.id, documentId));

            await tx.insert(schema.documentHistory).values({
                documentId,
                toAreaId: doc.destinationAreaId ?? '',
                userId,
                toUserId: userId,
                action: 'RECIBIR',
                receptionStatus: 'RECIBIDO',
                receivedAt: new Date(),
            });
        });
    }

    async rejectDocument({ documentId, userId, reason, organizationId }: { documentId: string; userId: string; reason: string; organizationId: string }): Promise<void> {
        await this.db.transaction(async (tx) => {
            const [doc] = await tx
                .select()
                .from(schema.documents)
                .where(and(eq(schema.documents.id, documentId), eq(schema.documents.organizationId, organizationId)));

            if (!doc) throw new Error('Documento no encontrado o sin acceso.');

            await tx
                .update(schema.documents)
                .set({ status: 'RECHAZADO', updatedAt: new Date() })
                .where(eq(schema.documents.id, documentId));

            await tx.insert(schema.documentHistory).values({
                documentId,
                toAreaId: doc.destinationAreaId ?? '',
                userId,
                action: 'RECHAZAR',
                receptionStatus: 'RECHAZADO',
                rejectionReason: reason,
            });
        });
    }

    async cancelDerivation({ documentId, userId, organizationId }: { documentId: string; userId: string; organizationId: string }): Promise<void> {
        await this.db.transaction(async (tx) => {
            const [doc] = await tx
                .select()
                .from(schema.documents)
                .where(and(eq(schema.documents.id, documentId), eq(schema.documents.organizationId, organizationId)));

            if (!doc) throw new Error('Documento no encontrado o sin acceso.');

            await tx
                .update(schema.documents)
                .set({ status: 'RECIBIDO', currentUserId: userId, updatedAt: new Date() })
                .where(eq(schema.documents.id, documentId));

            await tx.insert(schema.documentHistory).values({
                documentId,
                toAreaId: doc.destinationAreaId ?? '',
                userId,
                action: 'CANCELAR_DERIVACION',
                receptionStatus: 'CANCELADO',
            });
        });
    }

    async justifyDelay({ documentId, userId, reason, organizationId }: { documentId: string; userId: string; reason: string; organizationId: string }): Promise<void> {
        await this.db.transaction(async (tx) => {
            const [doc] = await tx
                .select()
                .from(schema.documents)
                .where(and(eq(schema.documents.id, documentId), eq(schema.documents.organizationId, organizationId)));

            if (!doc) throw new Error('Documento no encontrado o sin acceso.');

            await tx.insert(schema.documentHistory).values({
                documentId,
                toAreaId: doc.destinationAreaId ?? '',
                userId,
                action: 'JUSTIFICAR',
                justificationReason: reason,
            });
        });
    }

    async groupDocuments({ mainDocumentId, secondaryDocumentIds, organizationId }: { mainDocumentId: string; secondaryDocumentIds: string[]; organizationId: string }): Promise<void> {
        await this.db.transaction(async (tx) => {
            for (const secId of secondaryDocumentIds) {
                await tx
                    .update(schema.documents)
                    .set({ groupedIntoDocumentId: mainDocumentId, updatedAt: new Date() })
                    .where(and(eq(schema.documents.id, secId), eq(schema.documents.organizationId, organizationId)));
            }
        });
    }

    async archiveDocument({ documentId, folderCategory, observations, organizationId }: { documentId: string; folderCategory: string; observations: string | null; organizationId: string }): Promise<void> {
        await this.db.transaction(async (tx) => {
            const [doc] = await tx
                .select()
                .from(schema.documents)
                .where(and(eq(schema.documents.id, documentId), eq(schema.documents.organizationId, organizationId)));

            if (!doc) throw new Error('Documento no encontrado o sin acceso.');

            await tx
                .update(schema.documents)
                .set({ status: 'ARCHIVADO', folderCategory, archiveObservations: observations, updatedAt: new Date() })
                .where(eq(schema.documents.id, documentId));

            await tx.insert(schema.documentHistory).values({
                documentId,
                toAreaId: doc.destinationAreaId ?? '',
                userId: doc.currentUserId ?? '',
                action: 'ARCHIVAR',
                comment: observations,
            });
        });
    }

    async unarchiveDocument({ documentId, organizationId }: { documentId: string; organizationId: string }): Promise<void> {
        await this.db.transaction(async (tx) => {
            const [doc] = await tx
                .select()
                .from(schema.documents)
                .where(and(eq(schema.documents.id, documentId), eq(schema.documents.organizationId, organizationId)));

            if (!doc) throw new Error('Documento no encontrado o sin acceso.');

            await tx
                .update(schema.documents)
                .set({ status: 'RECIBIDO', folderCategory: null, archiveObservations: null, updatedAt: new Date() })
                .where(eq(schema.documents.id, documentId));

            await tx.insert(schema.documentHistory).values({
                documentId,
                toAreaId: doc.destinationAreaId ?? '',
                userId: doc.currentUserId ?? '',
                action: 'DESARCHIVAR',
            });
        });
    }

    async signDocument({
        documentId,
        signedByUserId,
        signatureHash,
        verificationCode,
        organizationId,
    }: {
        documentId: string;
        signedByUserId: string;
        signatureHash: string;
        verificationCode: string;
        organizationId: string;
    }): Promise<Document> {
        return await this.db.transaction(async (tx) => {
            const [doc] = await tx
                .select()
                .from(schema.documents)
                .where(and(eq(schema.documents.id, documentId), eq(schema.documents.organizationId, organizationId)));

            if (!doc) throw new Error('Documento no encontrado o sin acceso.');

            const now = new Date();
            const [updatedDoc] = await tx
                .update(schema.documents)
                .set({
                    isSigned: true,
                    signedAt: now,
                    signedByUserId,
                    signatureHash,
                    verificationCode,
                    updatedAt: now,
                })
                .where(eq(schema.documents.id, documentId))
                .returning();

            await tx.insert(schema.documentHistory).values({
                documentId,
                toAreaId: doc.destinationAreaId ?? '',
                userId: signedByUserId,
                action: 'FIRMAR_DIGITALMENTE',
                comment: `Documento firmado digitalmente. Código de verificación: ${verificationCode}`,
            });

            return updatedDoc;
        });
    }

    async findByVerificationCode({
        verificationCode,
    }: {
        verificationCode: string;
    }): Promise<(DocumentWithArea & { signedByUserName: string | null; organizationName: string | null }) | null> {
        const documentColumns = getTableColumns(schema.documents);
        const result = await this.db
            .select({
                ...documentColumns,
                destinationAreaName: schema.areaHierarchy.name,
                signedByUserName: schema.users.name,
                organizationName: schema.organizations.name,
            })
            .from(schema.documents)
            .leftJoin(
                schema.areaHierarchy,
                eq(schema.documents.destinationAreaId, schema.areaHierarchy.id)
            )
            .leftJoin(
                schema.users,
                eq(schema.documents.signedByUserId, schema.users.id)
            )
            .leftJoin(
                schema.organizations,
                eq(schema.documents.organizationId, schema.organizations.id)
            )
            .where(eq(schema.documents.verificationCode, verificationCode))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return result[0];
    }

    async findByTrackingCode({
        trackingCode,
    }: {
        trackingCode: string;
    }): Promise<(DocumentWithArea & { organizationName: string | null }) | null> {
        const documentColumns = getTableColumns(schema.documents);
        const result = await this.db
            .select({
                ...documentColumns,
                destinationAreaName: schema.areaHierarchy.name,
                organizationName: schema.organizations.name,
            })
            .from(schema.documents)
            .leftJoin(
                schema.areaHierarchy,
                eq(schema.documents.destinationAreaId, schema.areaHierarchy.id)
            )
            .leftJoin(
                schema.organizations,
                eq(schema.documents.organizationId, schema.organizations.id)
            )
            .where(
                sql`LOWER(${schema.documents.trackingCode}) = LOWER(${trackingCode}) OR LOWER(${schema.documents.trackingId}) = LOWER(${trackingCode})`
            )
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return result[0];
    }

    // Placeholder for other methods of the interface
    async create(data: typeof schema.documents.$inferInsert): Promise<any> {
        const [newInstance] = await this.db.insert(schema.documents).values(data).returning();
        return newInstance;
    }
}