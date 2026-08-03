import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateReportUseCase } from './generate-report.use-case';
import type { IDocumentRepository, Document } from '../core/document.repository';

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

describe('GenerateReportUseCase', () => {
    let useCase: GenerateReportUseCase;
    let mockRepo: MockDocumentRepository;

    beforeEach(() => {
        mockRepo = new MockDocumentRepository();
        useCase = new GenerateReportUseCase(mockRepo);
    });

    const mockDocs: Document[] = [
        {
            id: 'doc-1',
            organizationId: 'org-1',
            trackingId: 'I-2026-001',
            trackingCode: 'INF/001-2026',
            subject: 'Reporte Test',
            sender: 'Juan Perez',
            status: 'Recibido',
            receptionDate: new Date(),
            documentType: 'Informe',
            destinationAreaId: 'area-1',
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
        },
    ];

    it('debe estructurar los datos del reporte y resumen correctamente', async () => {
        mockRepo.findMany.mockResolvedValue({ data: mockDocs, total: 1 });

        const result = await useCase.execute({ organizationId: 'org-1' });

        expect(result.documents.length).toBe(1);
        expect(result.summary.totalDocuments).toBe(1);
        expect(result.summary.receivedCount).toBe(1);
        expect(mockRepo.findMany).toHaveBeenCalled();
    });
});
