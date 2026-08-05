import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import { AppError } from '~/core/errors/app.error';
import type { IDocumentRepository, Document } from '../core/document.repository';
import type { IJacobitusService, ITsaTimestampService } from '~/modules/firma-digital/core/jacobitus.service';

export type SignDocumentJacobitusParams = {
    documentId: string;
    organizationId: string;
    userId: string;
    slot: number;
    pin: string;
    alias: string;
    pdfBase64?: string;
};

@injectable()
export class SignDocumentJacobitusUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository,
        @inject(InjectionTokens.JacobitusService)
        private readonly jacobitusService: IJacobitusService,
        @inject(InjectionTokens.TsaTimestampService)
        private readonly tsaTimestampService: ITsaTimestampService
    ) { }

    async execute({
        documentId,
        organizationId,
        userId,
        slot,
        pin,
        alias,
        pdfBase64 = '',
    }: SignDocumentJacobitusParams): Promise<Document> {
        const doc = await this.documentRepository.findDetailsById({
            id: documentId,
            organizationId,
        });

        if (!doc) {
            throw new AppError('Documento no encontrado o sin permisos.');
        }

        if (doc.isSigned) {
            throw new AppError('El documento ya ha sido firmado digitalmente.');
        }

        // 1. Sign PDF via Jacobitus FIDO
        const signResult = await this.jacobitusService.signPdf({
            pdfBase64: pdfBase64 || Buffer.from(`DOC:${documentId}`).toString('base64'),
            slot,
            pin,
            alias,
        });

        // 2. Stamp Official TSA Timestamp
        const pdfBuffer = Buffer.from(signResult.signedPdfBase64, 'base64');
        const tsaResult = await this.tsaTimestampService.stampPdf(pdfBuffer);

        const verificationCode = `VRF-${signResult.signatureHash.slice(0, 8).toUpperCase()}`;

        // 3. Update Document Record
        const updated = await this.documentRepository.signDocument({
            documentId,
            signedByUserId: userId,
            signatureHash: signResult.signatureHash,
            verificationCode,
            organizationId,
            signedCertificateSubject: signResult.subject,
            signedCertificateIssuer: signResult.issuer,
            timestampAuthority: tsaResult.timestampAuthority,
            timestampedAt: tsaResult.timestampedAt,
        });

        return updated;
    }
}
