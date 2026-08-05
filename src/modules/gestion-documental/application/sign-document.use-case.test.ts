import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignDocumentUseCase } from './sign-document.use-case';
import type { IDocumentRepository } from '../core/document.repository';
import { AppError } from '@/core/errors/app.error';

describe('SignDocumentUseCase', () => {
    let repository: IDocumentRepository;
    let useCase: SignDocumentUseCase;

    beforeEach(() => {
        repository = {
            findDetailsById: vi.fn(),
            signDocument: vi.fn(),
            findByTrackingCode: vi.fn(),
        } as unknown as IDocumentRepository;

        useCase = new SignDocumentUseCase(repository);
    });

    it('debe lanzar error 404 si el documento no existe', async () => {
        vi.mocked(repository.findDetailsById).mockResolvedValue(null);

        await expect(
            useCase.execute({
                documentId: 'doc-1',
                userId: 'user-1',
                organizationId: 'org-1',
            })
        ).rejects.toThrow(new AppError('Documento no encontrado o sin permisos.', 404));
    });

    it('debe lanzar error si el documento ya está firmado', async () => {
        vi.mocked(repository.findDetailsById).mockResolvedValue({
            id: 'doc-1',
            trackingId: 'INF-001',
            isSigned: true,
        } as any);

        await expect(
            useCase.execute({
                documentId: 'doc-1',
                userId: 'user-1',
                organizationId: 'org-1',
            })
        ).rejects.toThrow(new AppError('El documento ya ha sido firmado digitalmente.', 400));
    });

    it('debe firmar el documento generando hash y código de verificación', async () => {
        vi.mocked(repository.findDetailsById).mockResolvedValue({
            id: 'doc-1',
            trackingId: 'INF-001',
            subject: 'Informe de prueba',
            isSigned: false,
        } as any);

        vi.mocked(repository.signDocument).mockResolvedValue({
            id: 'doc-1',
            isSigned: true,
            verificationCode: 'VRF-1234-5678',
        } as any);

        const result = await useCase.execute({
            documentId: 'doc-1',
            userId: 'user-1',
            organizationId: 'org-1',
        });

        expect(result.verificationCode).toMatch(/^VRF-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
        expect(result.signatureHash).toBeDefined();
        expect(repository.signDocument).toHaveBeenCalledWith({
            documentId: 'doc-1',
            signedByUserId: 'user-1',
            signatureHash: result.signatureHash,
            verificationCode: result.verificationCode,
            organizationId: 'org-1',
        });
    });
});
