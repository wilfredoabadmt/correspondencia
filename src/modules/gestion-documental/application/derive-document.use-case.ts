import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';
import { AppError } from '@/core/errors/app.error';

type DeriveDocumentUseCaseParams = {
    documentId: string;
    newAreaId: string;
    comment: string | null;
    userId: string;
    organizationId: string;
};

@injectable()
export class DeriveDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) { }

    async execute({
        documentId,
        newAreaId,
        comment,
        userId,
        organizationId,
    }: DeriveDocumentUseCaseParams): Promise<void> {
        // 1. Validate document existence and permissions
        const document = await this.documentRepository.findDetailsById({
            id: documentId,
            organizationId,
        });

        if (!document) {
            throw new AppError('Documento no encontrado o sin permisos para accederlo.', 404);
        }

        // 2. Validate business rules
        if (document.status !== 'Recibido') {
            throw new AppError(`No se puede derivar un documento en estado "${document.status}".`, 400);
        }

        if (document.destinationAreaId === newAreaId) {
            throw new AppError('El documento ya se encuentra en el área de destino seleccionada.', 400);
        }

        // 3. Execute the derivation
        await this.documentRepository.derive({
            documentId,
            fromAreaId: document.destinationAreaId,
            toAreaId: newAreaId,
            userId,
            comment,
        });
    }
}