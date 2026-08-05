import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';
import type { IDocumentHistoryRepository } from '../core/document-history.repository';

export type PublicTrackingResult = {
    trackingCode: string;
    subject: string;
    documentType: string;
    status: string;
    currentAreaName: string | null;
    organizationName: string | null;
    receptionDate: Date;
    isExternal: boolean;
    applicantName: string | null;
    applicantInstitution: string | null;
    history: Array<{
        timestamp: Date;
        action: string;
        fromAreaName: string | null;
        toAreaName: string | null;
    }>;
};

@injectable()
export class GetPublicTrackingInfoUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository,
        @inject(InjectionTokens.DocumentHistoryRepository)
        private readonly historyRepository: IDocumentHistoryRepository
    ) { }

    async execute(trackingCode: string): Promise<PublicTrackingResult | null> {
        if (!trackingCode || trackingCode.trim() === '') {
            return null;
        }

        const doc = await this.documentRepository.findByTrackingCode({
            trackingCode: trackingCode.trim(),
        });

        if (!doc) {
            return null;
        }

        const historyResult = await this.historyRepository.findByDocumentId(
            doc.id,
            doc.organizationId || '',
            50,
            0
        );

        const publicHistory = historyResult.history.map((h) => ({
            timestamp: h.createdAt,
            action: h.comment ? `Derivación: ${h.comment}` : 'Derivación / Movimiento',
            fromAreaName: h.fromAreaName,
            toAreaName: h.toAreaName,
        }));

        return {
            trackingCode: doc.trackingCode || '',
            subject: doc.subject || '',
            documentType: doc.documentType || '',
            status: doc.status || '',
            currentAreaName: doc.destinationAreaName,
            organizationName: doc.organizationName,
            receptionDate: doc.receptionDate || new Date(),
            isExternal: doc.isExternal ?? false,
            applicantName: doc.applicantName,
            applicantInstitution: doc.applicantInstitution,
            history: publicHistory,
        };
    }
}
