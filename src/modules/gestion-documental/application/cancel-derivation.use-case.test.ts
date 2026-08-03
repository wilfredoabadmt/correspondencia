import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelDerivationUseCase } from './cancel-derivation.use-case';
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
}

describe('CancelDerivationUseCase', () => {
    let useCase: CancelDerivationUseCase;
    let mockRepo: MockDocumentRepository;

    beforeEach(() => {
        mockRepo = new MockDocumentRepository();
        useCase = new CancelDerivationUseCase(mockRepo);
    });

    it('debe cancelar la derivación correctamente', async () => {
        const dto = { documentId: 'doc-1', userId: 'user-1', organizationId: 'org-1' };
        await useCase.execute(dto);

        expect(mockRepo.cancelDerivation).toHaveBeenCalledWith(dto);
    });
});
