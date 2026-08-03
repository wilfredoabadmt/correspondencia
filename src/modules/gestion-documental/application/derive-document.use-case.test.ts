import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { DeriveDocumentUseCase } from './derive-document.use-case';
import { IDocumentRepository, DocumentWithArea } from '../core/document.repository';
import { AppError } from '@/core/errors/app.error';

// Mocks
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

describe('DeriveDocumentUseCase', () => {
    let useCase: DeriveDocumentUseCase;
    let mockDocumentRepository: MockDocumentRepository;

    beforeEach(() => {
        mockDocumentRepository = new MockDocumentRepository();
        useCase = new DeriveDocumentUseCase(mockDocumentRepository);
    });

    const mockDocument: DocumentWithArea = {
        id: 'doc-123',
        organizationId: 'org-abc',
        status: 'Recibido',
        destinationAreaId: 'area-from',
        // other fields are not relevant for this test's logic
    } as DocumentWithArea;

    const useCaseParams = {
        documentId: 'doc-123',
        newAreaId: 'area-to',
        comment: 'Test comment',
        userId: 'user-xyz',
        organizationId: 'org-abc',
    };

    it('should successfully derive a document in "Recibido" state', async () => {
        // Arrange
        mockDocumentRepository.findDetailsById.mockResolvedValue(mockDocument);

        // Act
        await useCase.execute(useCaseParams);

        // Assert
        expect(mockDocumentRepository.findDetailsById).toHaveBeenCalledWith({
            id: useCaseParams.documentId,
            organizationId: useCaseParams.organizationId,
        });
        expect(mockDocumentRepository.derive).toHaveBeenCalledWith({
            documentId: useCaseParams.documentId,
            fromAreaId: mockDocument.destinationAreaId,
            toAreaId: useCaseParams.newAreaId,
            userId: useCaseParams.userId,
            comment: useCaseParams.comment,
        });
    });

    it('should throw an AppError if the document is not found', async () => {
        // Arrange
        mockDocumentRepository.findDetailsById.mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.execute(useCaseParams)).rejects.toThrow(AppError);
        await expect(useCase.execute(useCaseParams)).rejects.toThrow(
            'Documento no encontrado o sin permisos para accederlo.'
        );
    });

    it('should throw an AppError if the document is not in "Recibido" state', async () => {
        // Arrange
        const docInProcess = { ...mockDocument, status: 'En Proceso' };
        mockDocumentRepository.findDetailsById.mockResolvedValue(docInProcess);

        // Act & Assert
        await expect(useCase.execute(useCaseParams)).rejects.toThrow(AppError);
        await expect(useCase.execute(useCaseParams)).rejects.toThrow(
            'No se puede derivar un documento en estado "En Proceso".'
        );
    });

    it('should throw an AppError if the destination area is the same as the current one', async () => {
        // Arrange
        const paramsWithSameArea = { ...useCaseParams, newAreaId: 'area-from' };
        mockDocumentRepository.findDetailsById.mockResolvedValue(mockDocument);

        // Act & Assert
        await expect(useCase.execute(paramsWithSameArea)).rejects.toThrow(AppError);
        await expect(useCase.execute(paramsWithSameArea)).rejects.toThrow(
            'El documento ya se encuentra en el área de destino seleccionada.'
        );
    });
});