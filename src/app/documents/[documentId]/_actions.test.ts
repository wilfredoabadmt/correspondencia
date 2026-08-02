import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { getPaginatedDocumentHistory } from './_actions';
import { IDocumentHistoryRepository, HistoryEntry } from '~/modules/gestion-documental/core/document-history.repository';
import { InjectionTokens } from '~/core/injection-tokens';

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: vi.fn(),
}));

vi.mock('~/modules/auth/lib/auth', () => ({
    auth: mockAuth,
}));

const mockDocumentHistoryRepository: IDocumentHistoryRepository = { findByDocumentId: vi.fn() };

describe('Server Action: getPaginatedDocumentHistory', () => {
    const MOCK_DOCUMENT_ID = 'doc-123';

    beforeEach(() => {
        vi.clearAllMocks();
        container.clearInstances();
        container.register(InjectionTokens.DocumentHistoryRepository, {
            useValue: mockDocumentHistoryRepository,
        });
        mockAuth.mockResolvedValue({
            user: {
                id: 'user-1',
                name: 'Test User',
                role: 'ADMINISTRADOR',
                organizationId: 'org-123',
            },
        });
    });

    it('should return paginated history with hasMore = true if more items exist', async () => {
        const mockHistory: HistoryEntry[] = Array.from({ length: 11 }, (_, i) => ({
            id: `entry-${i}`,
            documentId: MOCK_DOCUMENT_ID,
            fromAreaId: `area-from-${i}`,
            toAreaId: `area-to-${i}`,
            userId: `user-${i}`,
            comment: `Comment ${i}`,
            createdAt: new Date(),
            fromAreaName: `From Area ${i}`,
            toAreaName: `To Area ${i}`,
            userName: `User ${i}`,
        }));

        mockDocumentHistoryRepository.findByDocumentId = vi.fn().mockResolvedValue({
            history: mockHistory,
            hasMore: true,
        });

        const limit = 10;
        const offset = 0;
        const result = await getPaginatedDocumentHistory(MOCK_DOCUMENT_ID, limit, offset);

        expect(result.history).toHaveLength(11);
        expect(result.hasMore).toBe(true);
    });

    it('should return paginated history with hasMore = false if no more items exist', async () => {
        const mockHistory: HistoryEntry[] = Array.from({ length: 5 }, (_, i) => ({
            id: `entry-${i}`,
            documentId: MOCK_DOCUMENT_ID,
            fromAreaId: `area-from-${i}`,
            toAreaId: `area-to-${i}`,
            userId: `user-${i}`,
            comment: `Comment ${i}`,
            createdAt: new Date(),
            fromAreaName: `From Area ${i}`,
            toAreaName: `To Area ${i}`,
            userName: `User ${i}`,
        }));

        mockDocumentHistoryRepository.findByDocumentId = vi.fn().mockResolvedValue({
            history: mockHistory,
            hasMore: false,
        });

        const limit = 10;
        const offset = 0;
        const result = await getPaginatedDocumentHistory(MOCK_DOCUMENT_ID, limit, offset);

        expect(result.history).toHaveLength(5);
        expect(result.hasMore).toBe(false);
    });

    it('should return empty history if no items are found', async () => {
        mockDocumentHistoryRepository.findByDocumentId = vi.fn().mockResolvedValue({ history: [], hasMore: false });
        const result = await getPaginatedDocumentHistory(MOCK_DOCUMENT_ID, 10, 0);
        expect(result.history).toHaveLength(0);
        expect(result.hasMore).toBe(false);
    });

    it('should throw an error for invalid limit or offset', async () => {
        await expect(getPaginatedDocumentHistory(MOCK_DOCUMENT_ID, 0, 0)).rejects.toThrow(
            'Limit must be positive and offset must be non-negative.',
        );
        await expect(getPaginatedDocumentHistory(MOCK_DOCUMENT_ID, 10, -1)).rejects.toThrow(
            'Limit must be positive and offset must be non-negative.',
        );
    });

    it('should propagate errors from the repository', async () => {
        mockDocumentHistoryRepository.findByDocumentId = vi.fn().mockRejectedValue(new Error('Database error'));
        await expect(getPaginatedDocumentHistory(MOCK_DOCUMENT_ID, 10, 0)).rejects.toThrow('Database error');
    });

    it('should enforce multi-tenancy by passing the organizationId to the use case', async () => {
        const specificOrgId = 'org-tenant-a';
        mockAuth.mockResolvedValue({
            user: {
                id: 'user-2',
                name: 'Tenant A User',
                role: 'OPERADOR',
                organizationId: specificOrgId,
            },
        });

        const mockHistory: HistoryEntry[] = [{
            id: 'entry-1',
            documentId: MOCK_DOCUMENT_ID,
            fromAreaId: 'area-from-1',
            toAreaId: 'area-to-1',
            userId: 'user-1',
            comment: 'Comment 1',
            createdAt: new Date(),
            fromAreaName: 'From Area 1',
            toAreaName: 'To Area 1',
            userName: 'User 1',
        }];
        mockDocumentHistoryRepository.findByDocumentId = vi.fn().mockResolvedValue({
            history: mockHistory,
            hasMore: false,
        });

        await getPaginatedDocumentHistory(MOCK_DOCUMENT_ID, 1, 0);

        expect(mockDocumentHistoryRepository.findByDocumentId).toHaveBeenCalledWith(MOCK_DOCUMENT_ID, specificOrgId, 1, 0);
    });
});