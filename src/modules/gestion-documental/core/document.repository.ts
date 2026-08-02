import type { documents } from '@/db/schema';

export type Document = typeof documents.$inferSelect;

export type PaginatedResult<T> = {
    data: T[];
    total: number;
};

export type FindManyDocumentsParams = {
    organizationId: string;
    page: number;
    pageSize: number;
    query?: string;
    status?: string;
};

/**
 * Extiende la entidad Document para incluir el nombre del área de destino,
 * obtenido a través de un JOIN.
 */
export type DocumentWithArea = Document & {
    destinationAreaName: string | null;
};

export type DeriveParams = {
    documentId: string;
    fromAreaId: string | null;
    toAreaId: string;
    userId: string;
    comment: string | null;
};

export interface IDocumentRepository {
    create(data: typeof documents.$inferInsert): Promise<Document>;

    findDetailsById(params: { id: string; organizationId: string }): Promise<DocumentWithArea | null>;

    findMany(params: FindManyDocumentsParams): Promise<PaginatedResult<Document>>;

    derive(params: DeriveParams): Promise<void>;
}