import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { GetDocumentDetailsUseCase } from './get-document-details.use-case';
import type { IDocumentRepository, DocumentWithArea } from '../core/document.repository';
import type { IStorageService } from '~/modules/storage/core/storage.service';

class MockDocumentRepository implements IDocumentRepository {
    create = vi.fn();
    findDetailsById = vi.fn();
    findMany = vi.fn();
    derive = vi.fn();
}

class MockStorageService implements IStorageService {
    getDownloadUrl = vi.fn();
}

describe('GetDocumentDetailsUseCase', () => {
    let useCase: GetDocumentDetailsUseCase;
    let mockDocumentRepository: MockDocumentRepository;
    let mockStorageService: MockStorageService;

    beforeEach(() => {
        mockDocumentRepository = new MockDocumentRepository();
        mockStorageService = new MockStorageService();
        useCase = new GetDocumentDetailsUseCase(mockDocumentRepository, mockStorageService);
    });

    const mockDocument: DocumentWithArea = {
        id: 'doc-123',
        organizationId: 'org-abc',
        trackingId: 'T-2024-001',
        trackingCode: 'T-2024-001',
        subject: 'Test Subject',
        sender: 'Test Sender',
        status: 'Recibido',
        receptionDate: new Date(),
        documentType: 'Oficio',
        destinationAreaId: 'area-456',
        destinationAreaName: 'Área de Pruebas',
        areaHierarchyId: 'area-456',
        fileKey: 'uploads/test-file.pdf',
        downloadUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should return document details with a download URL when a fileKey exists', async () => {
        const downloadUrl = 'https://fake-storage.com/signed-url';
        mockDocumentRepository.findDetailsById.mockResolvedValue(mockDocument);
        mockStorageService.getDownloadUrl.mockResolvedValue(downloadUrl);

        const result = await useCase.execute({ documentId: 'doc-123', organizationId: 'org-abc' });

        expect(result).not.toBeNull();
        expect(result?.id).toBe('doc-123');
        expect(result?.downloadUrl).toBe(downloadUrl);
        expect(mockDocumentRepository.findDetailsById).toHaveBeenCalledWith({ id: 'doc-123', organizationId: 'org-abc' });
        expect(mockStorageService.getDownloadUrl).toHaveBeenCalledWith(mockDocument.fileKey);
    });

    it('should return document details with a null download URL when no fileKey exists', async () => {
        const docWithoutFile = { ...mockDocument, fileKey: null };
        mockDocumentRepository.findDetailsById.mockResolvedValue(docWithoutFile);

        const result = await useCase.execute({ documentId: 'doc-123', organizationId: 'org-abc' });

        expect(result).not.toBeNull();
        expect(result?.downloadUrl).toBeNull();
        expect(mockStorageService.getDownloadUrl).not.toHaveBeenCalled();
    });

    it('should return null if the document is not found in the repository', async () => {
        mockDocumentRepository.findDetailsById.mockResolvedValue(null);

        const result = await useCase.execute({ documentId: 'non-existent-doc', organizationId: 'org-abc' });

        expect(result).toBeNull();
    });

    it('should return null when trying to access a document from another organization (IDOR protection)', async () => {
        mockDocumentRepository.findDetailsById.mockResolvedValue(null);

        const result = await useCase.execute({ documentId: 'doc-from-other-org', organizationId: 'wrong-org-id' });

        expect(result).toBeNull();
        expect(mockDocumentRepository.findDetailsById).toHaveBeenCalledWith({ id: 'doc-from-other-org', organizationId: 'wrong-org-id' });
    });
});