import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyDocumentUseCase } from './verify-document.use-case';
import type { IDocumentRepository } from '../core/document.repository';

describe('VerifyDocumentUseCase', () => {
    let repository: IDocumentRepository;
    let useCase: VerifyDocumentUseCase;

    beforeEach(() => {
        repository = {
            findByVerificationCode: vi.fn(),
            findByTrackingCode: vi.fn(),
        } as unknown as IDocumentRepository;

        useCase = new VerifyDocumentUseCase(repository);
    });

    it('debe retornar isValid=false para código no existente o no firmado', async () => {
        vi.mocked(repository.findByVerificationCode).mockResolvedValue(null);

        const result = await useCase.execute('INVALID-CODE');

        expect(result.isValid).toBe(false);
        expect(result.verificationCode).toBe('INVALID-CODE');
    });

    it('debe retornar metadatos públicos completos cuando el documento es válido', async () => {
        vi.mocked(repository.findByVerificationCode).mockResolvedValue({
            id: 'doc-1',
            isSigned: true,
            verificationCode: 'VRF-ABCD-1234',
            trackingCode: 'INF-2026-001',
            subject: 'Prueba de verificación',
            documentType: 'Informe',
            signedByUserName: 'Juan Pérez',
            organizationName: 'Ministerio Test',
            destinationAreaName: 'DTI',
            signedAt: new Date('2026-08-05T12:00:00Z'),
            signatureHash: 'HASH123456789',
        } as any);

        const result = await useCase.execute('VRF-ABCD-1234');

        expect(result.isValid).toBe(true);
        expect(result.trackingCode).toBe('INF-2026-001');
        expect(result.signedByUserName).toBe('Juan Pérez');
        expect(result.signatureHash).toBe('HASH123456789');
    });
});
