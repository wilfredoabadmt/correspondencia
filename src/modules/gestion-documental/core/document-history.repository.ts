export type HistoryEntry = {
    id: string;
    documentId: string;
    fromAreaId: string | null;
    toAreaId: string;
    userId: string;
    comment: string | null;
    createdAt: Date;
    fromAreaName: string | null;
    toAreaName: string;
    userName: string | null;
};

export type PaginatedHistory = {
    history: HistoryEntry[];
    hasMore: boolean;
};

export interface IDocumentHistoryRepository {
    findByDocumentId(documentId: string, organizationId: string, limit: number, offset: number): Promise<PaginatedHistory>;
}