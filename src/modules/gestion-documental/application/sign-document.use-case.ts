import { createHash, randomBytes } from 'crypto';
import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository, Document } from '../core/document.repository';
import { AppError } from '@/core/errors/app.error';

type SignDocumentUseCaseParams = {
    documentId: string;
    userId: string;
    organizationId: string;
};

@injectable()
export class SignDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) { }

    async execute({
        documentId,
        userId,
        organizationId,
    }: SignDocumentUseCaseParams): Promise<{ document: Document; verificationCode: string; signatureHash: string }> {
        const document = await this.documentRepository.findDetailsById({
            id: documentId,
            organizationId,
        });

        if (!document) {
            throw new AppError('Documento no encontrado o sin permisos.', 404);
        }

        if (document.isSigned) {
            throw new AppError('El documento ya ha sido firmado digitalmente.', 400);
        }

        // Generar hash de firma digital SHA-256 basado en metadatos y timestamp
        const timestamp = new Date().toISOString();
        const payload = `${document.id}:${document.trackingId || ''}:${document.subject || ''}:${userId}:${organizationId}:${timestamp}`;
        const signatureHash = createHash('sha256').update(payload).digest('hex').toUpperCase();

        // Generar código único de verificación (ej: VRF-8A9B-3C2D)
        const randomPart = randomBytes(4).toString('hex').toUpperCase();
        const verificationCode = `VRF-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}`;

        const updatedDoc = await this.documentRepository.signDocument({
            documentId,
            signedByUserId: userId,
            signatureHash,
            verificationCode,
            organizationId,
        });

        return {
            document: updatedDoc,
            verificationCode,
            signatureHash,
        };
    }
}
