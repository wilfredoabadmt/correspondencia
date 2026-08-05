import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPublicTrackingInfoUseCase } from './get-public-tracking-info.use-case';
import type { IDocumentRepository, DocumentWithArea } from '../core/document.repository';
import type { IDocumentHistoryRepository } from '../core/document-history.repository';

describe('GetPublicTrackingInfoUseCase', () => {
    let docRepo: IDocumentRepository;
    let historyRepo: IDocumentHistoryRepository;
    let useCase: GetPublicTrackingInfoUseCase;

    beforeEach(() => {
        docRepo = {
            create: vi.fn(),
            findDetailsById: vi.fn(),
            findMany: vi.fn(),
            derive: vi.fn(),
            receiveDocument: vi.fn(),
            rejectDocument: vi.fn(),
            cancelDerivation: vi.fn(),
            justifyDelay: vi.fn(),
            groupDocuments: vi.fn(),
            archiveDocument: vi.fn(),
            unarchiveDocument: vi.fn(),
            signDocument: vi.fn(),
            findByVerificationCode: vi.fn(),
            findByTrackingCode: vi.fn(),
        };

        historyRepo = {
            findByDocumentId: vi.fn(),
        };

        useCase = new GetPublicTrackingInfoUseCase(docRepo, historyRepo);
    });

    it('debe retornar información pública no confidencial para un código de CITE existente', async () => {
        const mockDoc: DocumentWithArea & { organizationName: string } = {
            id: 'doc-100',
            organizationId: 'org-1',
            trackingCode: 'MIN/DTI/INF/N°-0001/2026',
            trackingId: 'MIN/DTI/INF/N°-0001/2026',
            subject: 'Solicitud de Conexión',
            sender: 'Juan Pérez',
            documentType: 'Carta Externa',
            status: 'Recibido',
            destinationAreaId: 'area-1',
            destinationAreaName: 'Mesa de Partes',
            organizationName: 'Ministerio de prueba',
            receptionDate: new Date('2026-08-01T10:00:00Z'),
            isExternal: true,
            applicantName: 'Juan Pérez',
            applicantInstitution: 'Empresa ABC',
            applicantIdentityDocument: '1234567 LP',
            applicantPhone: null,
            applicantEmail: null,
            signedCertificateSubject: null,
            signedCertificateIssuer: null,
            timestampAuthority: null,
            timestampedAt: null,
            areaHierarchyId: 'area-1',
            fileKey: null,
            downloadUrl: null,
            expedienteId: null,
            currentUserId: null,
            groupedIntoDocumentId: null,
            folderCategory: null,
            archiveObservations: null,
            isSigned: false,
            signedAt: null,
            signedByUserId: null,
            signatureHash: null,
            verificationCode: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        vi.mocked(docRepo.findByTrackingCode).mockResolvedValue(mockDoc);
        vi.mocked(historyRepo.findByDocumentId).mockResolvedValue({
            history: [
                {
                    id: 'h-1',
                    documentId: 'doc-100',
                    fromAreaId: null,
                    toAreaId: 'area-1',
                    userId: 'usr-1',
                    comment: 'Registro',
                    createdAt: new Date('2026-08-01T10:00:00Z'),
                    fromAreaName: null,
                    toAreaName: 'Mesa de Partes',
                    userName: 'Operador',
                },
            ],
            hasMore: false,
        });

        const result = await useCase.execute('MIN/DTI/INF/N°-0001/2026');

        expect(result).not.toBeNull();
        expect(result?.trackingCode).toBe('MIN/DTI/INF/N°-0001/2026');
        expect(result?.applicantName).toBe('Juan Pérez');
        expect(result?.history.length).toBe(1);
    });

    it('debe retornar null si el código no existe', async () => {
        vi.mocked(docRepo.findByTrackingCode).mockResolvedValue(null);

        const result = await useCase.execute('CODIGO-INVALIDO');

        expect(result).toBeNull();
    });
});
