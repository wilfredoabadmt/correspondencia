import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateRoutingSlipPdfUseCase } from './generate-routing-slip-pdf.use-case';
import type { IDocumentRepository, DocumentWithArea } from '../core/document.repository';
import type { IDocumentHistoryRepository } from '../core/document-history.repository';
import type { IPdfGeneratorService } from '../core/pdf-generator.service';
import type { IStorageService } from '~/modules/storage/core/storage.service';

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

class MockHistoryRepository implements IDocumentHistoryRepository {
    create = vi.fn();
    findByDocumentId = vi.fn();
}

class MockPdfGeneratorService implements IPdfGeneratorService {
    generateRoutingSlipPdf = vi.fn();
}

class MockStorageService implements IStorageService {
    getDownloadUrl = vi.fn();
    uploadFile = vi.fn();
    getFileBuffer = vi.fn();
}

describe('GenerateRoutingSlipPdfUseCase', () => {
    let useCase: GenerateRoutingSlipPdfUseCase;
    let mockDocRepo: MockDocumentRepository;
    let mockHistRepo: MockHistoryRepository;
    let mockPdfService: MockPdfGeneratorService;
    let mockStorageService: MockStorageService;

    beforeEach(() => {
        mockDocRepo = new MockDocumentRepository();
        mockHistRepo = new MockHistoryRepository();
        mockPdfService = new MockPdfGeneratorService();
        mockStorageService = new MockStorageService();
        mockStorageService.getFileBuffer.mockRejectedValue(new Error('not found'));
        useCase = new GenerateRoutingSlipPdfUseCase(mockDocRepo, mockHistRepo, mockPdfService, mockStorageService);
    });

    const mockDoc: DocumentWithArea = {
        id: 'doc-1',
        organizationId: 'org-1',
        trackingId: 'I-2026-001',
        trackingCode: 'INF/001-2026',
        subject: 'Informe Prueba',
        sender: 'Remitente Test',
        status: 'Recibido',
        receptionDate: new Date(),
        documentType: 'Informe',
        destinationAreaId: 'area-1',
        destinationAreaName: 'Unidad Test',
        areaHierarchyId: 'area-1',
        currentUserId: null,
        groupedIntoDocumentId: null,
        folderCategory: null,
        archiveObservations: null,
        fileKey: null,
        downloadUrl: null,
        expedienteId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('debe generar la Hoja de Ruta en PDF si el documento existe', async () => {
        mockDocRepo.findDetailsById.mockResolvedValue(mockDoc);
        mockHistRepo.findByDocumentId.mockResolvedValue({ history: [], hasMore: false });
        mockPdfService.generateRoutingSlipPdf.mockResolvedValue(Buffer.from('fake-pdf-content'));

        const result = await useCase.execute({ documentId: 'doc-1', organizationId: 'org-1' });

        expect(result.fileName).toContain('HojaDeRuta_I-2026-001.pdf');
        expect(result.buffer).toBeDefined();
        expect(mockPdfService.generateRoutingSlipPdf).toHaveBeenCalled();
    });

    it('debe fallar si el documento no existe', async () => {
        mockDocRepo.findDetailsById.mockResolvedValue(null);

        await expect(useCase.execute({ documentId: 'doc-invalid', organizationId: 'org-1' }))
            .rejects.toThrow('Documento no encontrado o no tiene autorización para acceder.');
    });
});
