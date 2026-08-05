import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RejectDocumentUseCase } from './reject-document.use-case';
import type { IDocumentRepository } from '../core/document.repository';

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

describe('RejectDocumentUseCase', () => {
    let useCase: RejectDocumentUseCase;
    let mockRepo: MockDocumentRepository;

    beforeEach(() => {
        mockRepo = new MockDocumentRepository();
        useCase = new RejectDocumentUseCase(mockRepo);
    });

    it('debe invocar rejectDocument con el motivo cuando es válido', async () => {
        const dto = { documentId: 'doc-1', userId: 'user-1', reason: 'Falta documento físico', organizationId: 'org-1' };
        await useCase.execute(dto);

        expect(mockRepo.rejectDocument).toHaveBeenCalledWith(dto);
    });

    it('debe fallar si el motivo está vacío', async () => {
        await expect(useCase.execute({ documentId: 'doc-1', userId: 'user-1', reason: '', organizationId: 'org-1' }))
            .rejects.toThrow('El motivo de rechazo es obligatorio.');
    });
});
