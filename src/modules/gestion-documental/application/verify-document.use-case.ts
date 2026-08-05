import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

export type PublicVerificationDetails = {
    isValid: boolean;
    verificationCode: string;
    trackingCode: string | null;
    subject: string | null;
    documentType: string | null;
    signedByUserName: string | null;
    organizationName: string | null;
    destinationAreaName: string | null;
    signedAt: Date | null;
    signatureHash: string | null;
};

@injectable()
export class VerifyDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) { }

    async execute(verificationCode: string): Promise<PublicVerificationDetails> {
        const doc = await this.documentRepository.findByVerificationCode({ verificationCode });

        if (!doc || !doc.isSigned) {
            return {
                isValid: false,
                verificationCode,
                trackingCode: null,
                subject: null,
                documentType: null,
                signedByUserName: null,
                organizationName: null,
                destinationAreaName: null,
                signedAt: null,
                signatureHash: null,
            };
        }

        return {
            isValid: true,
            verificationCode: doc.verificationCode || verificationCode,
            trackingCode: doc.trackingCode,
            subject: doc.subject,
            documentType: doc.documentType,
            signedByUserName: doc.signedByUserName,
            organizationName: doc.organizationName,
            destinationAreaName: doc.destinationAreaName,
            signedAt: doc.signedAt,
            signatureHash: doc.signatureHash,
        };
    }
}
