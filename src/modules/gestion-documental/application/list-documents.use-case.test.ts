import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ListDocumentsUseCase } from './list-documents.use-case';
import type {
    IDocumentRepository,
    PaginatedResult,
    Document,
} from '../core/document.repository';

class MockDocumentRepository implements IDocumentRepository {
    create = vi.fn();
    findDetailsById = vi.fn();
    findMany = vi.fn();
    derive = vi.fn();
    receiveDocument = vi.fn();
    rejectDocument = vi.fn();
    cancelDerivation = vi.fn();
    justifyDelay = vi.fn();
    groupDocuments = vi.fn();
    archiveDocument = vi.fn();
    unarchiveDocument = vi.fn();
}

describe('ListDocumentsUseCase', () => {
    let useCase: ListDocumentsUseCase;
    let mockDocumentRepository: MockDocumentRepository;

    beforeEach(() => {
        mockDocumentRepository = new MockDocumentRepository();
        useCase = new ListDocumentsUseCase(mockDocumentRepository);
    });

    it('should call the repository with correct parameters and calculate pagination', async () => {
        const params = {
            organizationId: 'org-123',
            page: 2,
            pageSize: 10,
            query: 'test',
            status: 'Recibido',
        };
        const mockPaginatedResult: PaginatedResult<Document> = {
            data: [{ id: 'doc-1' } as Document],
            total: 25,
        };
        mockDocumentRepository.findMany.mockResolvedValue(mockPaginatedResult);

        const result = await useCase.execute(params);

        expect(mockDocumentRepository.findMany).toHaveBeenCalledWith(params);
        expect(result.data).toEqual(mockPaginatedResult.data);
        expect(result.total).toBe(25);
        expect(result.currentPage).toBe(2);
        expect(result.totalPages).toBe(3);
    });

    it('should handle zero results correctly', async () => {
        const params = {
            organizationId: 'org-123',
            page: 1,
            pageSize: 10,
            query: 'non-existent',
        };
        const mockPaginatedResult: PaginatedResult<Document> = {
            data: [],
            total: 0,
        };
        mockDocumentRepository.findMany.mockResolvedValue(mockPaginatedResult);

        const result = await useCase.execute(params);

        expect(mockDocumentRepository.findMany).toHaveBeenCalledWith(params);
        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
        expect(result.currentPage).toBe(1);
        expect(result.totalPages).toBe(0);
    });
});