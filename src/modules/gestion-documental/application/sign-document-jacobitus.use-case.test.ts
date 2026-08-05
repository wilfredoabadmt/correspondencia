import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignDocumentJacobitusUseCase } from './sign-document-jacobitus.use-case';
import type { IDocumentRepository, DocumentWithArea } from '../core/document.repository';
import type { IJacobitusService, ITsaTimestampService } from '~/modules/firma-digital/core/jacobitus.service';

describe('SignDocumentJacobitusUseCase', () => {
    let docRepo: IDocumentRepository;
    let jacobitusService: IJacobitusService;
    let tsaService: ITsaTimestampService;
    let useCase: SignDocumentJacobitusUseCase;

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

        jacobitusService = {
            getSlots: vi.fn(),
            getCertificates: vi.fn(),
            signPdf: vi.fn(),
        };

        tsaService = {
            stampPdf: vi.fn(),
        };

        useCase = new SignDocumentJacobitusUseCase(docRepo, jacobitusService, tsaService);
    });

    it('debe firmar digitalmente un documento con Jacobitus FIDO y estampar sello TSA', async () => {
        const mockDoc: DocumentWithArea = {
            id: 'doc-1',
            organizationId: 'org-1',
            destinationAreaId: 'area-1',
            destinationAreaName: 'DTI',
            status: 'Recibido',
            trackingCode: 'CITE-001',
            trackingId: 'CITE-001',
            subject: 'Informe de gestión',
            sender: 'Remitente',
            receptionDate: new Date(),
            documentType: 'Informe',
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

        vi.mocked(docRepo.findDetailsById).mockResolvedValue(mockDoc);
        vi.mocked(jacobitusService.signPdf).mockResolvedValue({
            signedPdfBase64: 'BASE64SIGNEDPDF',
            signatureHash: 'HASH1234567890ABCDEF',
            subject: 'CN=JUAN PEREZ, CI=1234567',
            issuer: 'CN=ADSIB CA',
        });
        vi.mocked(tsaService.stampPdf).mockResolvedValue({
            timestampedPdfBuffer: Buffer.from('BASE64SIGNEDPDF'),
            timestampAuthority: 'TSA ADSIB',
            timestampedAt: new Date('2026-08-05T12:00:00Z'),
        });
        vi.mocked(docRepo.signDocument).mockResolvedValue({
            ...mockDoc,
            isSigned: true,
            signatureHash: 'HASH1234567890ABCDEF',
            verificationCode: 'VRF-HASH1234',
        });

        const result = await useCase.execute({
            documentId: 'doc-1',
            organizationId: 'org-1',
            userId: 'user-1',
            slot: 1,
            pin: '123456',
            alias: 'cert-oficial',
        });

        expect(jacobitusService.signPdf).toHaveBeenCalledWith(expect.objectContaining({ slot: 1, pin: '123456' }));
        expect(tsaService.stampPdf).toHaveBeenCalled();
        expect(docRepo.signDocument).toHaveBeenCalledWith(expect.objectContaining({
            signedCertificateSubject: 'CN=JUAN PEREZ, CI=1234567',
            signedCertificateIssuer: 'CN=ADSIB CA',
            timestampAuthority: 'TSA ADSIB',
        }));
        expect(result.isSigned).toBe(true);
    });
});
