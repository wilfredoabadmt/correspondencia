import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import { AppError } from '~/core/errors/app.error';
import type { IDocumentRepository } from '../core/document.repository';

export type DeriveMultidestinationParams = {
    documentId: string;
    organizationId: string;
    userId: string;
    originalAreaId: string;
    copyAreaIds?: string[];
    instructionCodes?: string[];
    comment?: string | null;
};

@injectable()
export class DeriveMultidestinationDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) { }

    async execute({
        documentId,
        organizationId,
        userId,
        originalAreaId,
        copyAreaIds = [],
        instructionCodes = [],
        comment,
    }: DeriveMultidestinationParams): Promise<void> {
        const document = await this.documentRepository.findDetailsById({
            id: documentId,
            organizationId,
        });

        if (!document) {
            throw new AppError('Documento no encontrado o sin permisos para accederlo.');
        }

        if (document.status !== 'Recibido' && document.status !== 'En Proceso') {
            throw new AppError(`No se puede derivar un documento en estado "${document.status}".`);
        }

        const instructionsText = instructionCodes.length > 0
            ? `[Proveído: ${instructionCodes.join(', ')}] `
            : '';

        const fullComment = `${instructionsText}${comment || ''}`.trim() || null;

        // 1. Primary Original Derivation
        await this.documentRepository.derive({
            documentId,
            fromAreaId: document.destinationAreaId,
            toAreaId: originalAreaId,
            userId,
            comment: fullComment,
            derivationType: 'OFICIAL',
            instructionCode: instructionCodes[0],
        });

        // 2. Secondary Copy Derivations (Informativas)
        for (const copyAreaId of copyAreaIds) {
            if (copyAreaId !== originalAreaId) {
                await this.documentRepository.derive({
                    documentId,
                    fromAreaId: document.destinationAreaId,
                    toAreaId: copyAreaId,
                    userId,
                    comment: `[COPIA INFORMATIVA] ${fullComment || ''}`.trim(),
                    derivationType: 'COPIA',
                    instructionCode: instructionCodes[0],
                });
            }
        }
    }
}
