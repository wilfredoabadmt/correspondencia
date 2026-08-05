import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateDocxTemplateUseCase } from './generate-docx-template.use-case';
import type { IDocumentRepository, DocumentWithArea } from '../core/document.repository';
import type { IDocxGeneratorService } from '../core/docx-generator.service';

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
    signDocument = vi.fn();
    findByVerificationCode = vi.fn();
}

class MockDocxGeneratorService implements IDocxGeneratorService {
    generateTemplate = vi.fn();
}

describe('GenerateDocxTemplateUseCase', () => {
    let useCase: GenerateDocxTemplateUseCase;
    let mockRepo: MockDocumentRepository;
    let mockDocxService: MockDocxGeneratorService;

    beforeEach(() => {
        mockRepo = new MockDocumentRepository();
        mockDocxService = new MockDocxGeneratorService();
        useCase = new GenerateDocxTemplateUseCase(mockRepo, mockDocxService);
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
        isSigned: false,
        signedAt: null,
        signedByUserId: null,
        signatureHash: null,
        verificationCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('debe generar la plantilla docx si el documento existe', async () => {
        mockRepo.findDetailsById.mockResolvedValue(mockDoc);
        mockDocxService.generateTemplate.mockResolvedValue(Buffer.from('fake-docx-content'));

        const result = await useCase.execute({ documentId: 'doc-1', organizationId: 'org-1' });

        expect(result.fileName).toContain('INF_001-2026.docx');
        expect(result.buffer).toBeDefined();
        expect(mockDocxService.generateTemplate).toHaveBeenCalled();
    });

    it('debe generar una plantilla con datos por defecto si el documento no se encuentra en BD', async () => {
        mockRepo.findDetailsById.mockResolvedValue(null);
        mockDocxService.generateTemplate.mockResolvedValue(Buffer.from('fake-docx-content'));

        const result = await useCase.execute({ documentId: 'doc-invalid', organizationId: 'org-1' });

        expect(result.fileName).toContain('DOC-doc-inva.docx');
        expect(result.buffer).toBeDefined();
        expect(mockDocxService.generateTemplate).toHaveBeenCalled();
    });
});

