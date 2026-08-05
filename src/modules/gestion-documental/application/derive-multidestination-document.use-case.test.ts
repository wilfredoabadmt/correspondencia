import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeriveMultidestinationDocumentUseCase } from './derive-multidestination-document.use-case';
import type { IDocumentRepository, DocumentWithArea } from '../core/document.repository';

describe('DeriveMultidestinationDocumentUseCase', () => {
    let repo: IDocumentRepository;
    let useCase: DeriveMultidestinationDocumentUseCase;

    beforeEach(() => {
        repo = {
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

        useCase = new DeriveMultidestinationDocumentUseCase(repo);
    });

    it('debe realizar la derivación principal (Original) y copias secundarias (Copia)', async () => {
        const mockDoc: DocumentWithArea = {
            id: 'doc-1',
            organizationId: 'org-1',
            destinationAreaId: 'area-origen',
            destinationAreaName: 'Área Origen',
            status: 'Recibido',
            trackingCode: 'CITE-001',
            trackingId: 'CITE-001',
            subject: 'Informe de gestión',
            sender: 'Remitente',
            receptionDate: new Date(),
            documentType: 'Informe',
            areaHierarchyId: 'area-origen',
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
            isExternal: false,
            applicantIdentityDocument: null,
            applicantName: null,
            applicantInstitution: null,
            applicantPhone: null,
            applicantEmail: null,
            signedCertificateSubject: null,
            signedCertificateIssuer: null,
            timestampAuthority: null,
            timestampedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        vi.mocked(repo.findDetailsById).mockResolvedValue(mockDoc);

        await useCase.execute({
            documentId: 'doc-1',
            organizationId: 'org-1',
            userId: 'user-1',
            originalAreaId: 'area-dest-principal',
            copyAreaIds: ['area-copia-1', 'area-copia-2'],
            instructionCodes: ['PROV-01'],
            comment: 'Por favor atender rápido',
        });

        expect(repo.derive).toHaveBeenCalledTimes(3);
        // Original call
        expect(repo.derive).toHaveBeenNthCalledWith(1, expect.objectContaining({
            documentId: 'doc-1',
            toAreaId: 'area-dest-principal',
            derivationType: 'OFICIAL',
            instructionCode: 'PROV-01',
        }));
        // Copy 1 call
        expect(repo.derive).toHaveBeenNthCalledWith(2, expect.objectContaining({
            documentId: 'doc-1',
            toAreaId: 'area-copia-1',
            derivationType: 'COPIA',
            instructionCode: 'PROV-01',
        }));
    });
});
