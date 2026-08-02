import { describe, it, expect } from 'vitest';
import { DocumentDetailsCard } from './document-details-card';
import type { GetDocumentDetailsUseCaseResult } from '~/modules/gestion-documental/application/get-document-details.use-case';

describe('DocumentDetailsCard', () => {
    const mockDocument: GetDocumentDetailsUseCaseResult = {
        id: 'doc-123',
        organizationId: 'org-abc',
        trackingId: 'T-2024-001',
        trackingCode: 'T-2024-001',
        subject: 'Asunto de Prueba',
        sender: 'Remitente de Prueba',
        status: 'Recibido',
        receptionDate: new Date('2024-07-30T10:30:00Z'),
        documentType: 'Oficio',
        destinationAreaId: 'area-456',
        destinationAreaName: 'Área de Destino de Prueba',
        areaHierarchyId: 'area-456',
        fileKey: 'key.pdf',
        downloadUrl: 'http://fake.url/download',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should be defined and return JSX component', () => {
        const component = DocumentDetailsCard({ document: mockDocument });
        expect(component).toBeDefined();
    });
});