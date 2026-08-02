import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { GetDocumentHistoryUseCase } from './get-document-history.use-case';
import type { HistoryEntry, IDocumentHistoryRepository } from '../core/document-history.repository';

class MockDocumentHistoryRepository implements IDocumentHistoryRepository {
    findByDocumentId = vi.fn();
}

describe('GetDocumentHistoryUseCase', () => {
    let useCase: GetDocumentHistoryUseCase;
    let mockRepository: MockDocumentHistoryRepository;

    beforeEach(() => {
        mockRepository = new MockDocumentHistoryRepository();
        useCase = new GetDocumentHistoryUseCase(mockRepository);
    });

    const mockHistory: HistoryEntry[] = [
        {
            id: 'history-1',
            documentId: 'doc-123',
            fromAreaId: 'area-1',
            toAreaId: 'area-2',
            userId: 'user-1',
            comment: 'Derivación para atención',
            createdAt: new Date(),
            fromAreaName: 'Mesa de Partes',
            toAreaName: 'Gerencia General',
            userName: 'Juan Pérez',
        },
    ];

    it('should return history entries from the repository for a given documentId', async () => {
        mockRepository.findByDocumentId.mockResolvedValue({ history: mockHistory, hasMore: false });

        const result = await useCase.execute({ documentId: 'doc-123' });

        expect(result.history).toEqual(mockHistory);
        expect(mockRepository.findByDocumentId).toHaveBeenCalledWith('doc-123', '', 10, 0);
    });

    it('should return an empty array if no history exists for the document', async () => {
        mockRepository.findByDocumentId.mockResolvedValue({ history: [], hasMore: false });

        const result = await useCase.execute({ documentId: 'doc-empty' });

        expect(result.history).toEqual([]);
        expect(mockRepository.findByDocumentId).toHaveBeenCalledWith('doc-empty', '', 10, 0);
    });
});
