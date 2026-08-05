import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReceiveDocumentUseCase } from './receive-document.use-case';
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

describe('ReceiveDocumentUseCase', () => {
    let useCase: ReceiveDocumentUseCase;
    let mockRepo: MockDocumentRepository;

    beforeEach(() => {
        mockRepo = new MockDocumentRepository();
        useCase = new ReceiveDocumentUseCase(mockRepo);
    });

    it('debe invocar receiveDocument del repositorio con los parámetros requeridos', async () => {
        const dto = { documentId: 'doc-1', userId: 'user-1', organizationId: 'org-1' };
        await useCase.execute(dto);

        expect(mockRepo.receiveDocument).toHaveBeenCalledWith(dto);
    });

    it('debe lanzar un error si falta el documentId', async () => {
        await expect(useCase.execute({ documentId: '', userId: 'user-1', organizationId: 'org-1' }))
            .rejects.toThrow('ID de documento es requerido.');
    });
});
