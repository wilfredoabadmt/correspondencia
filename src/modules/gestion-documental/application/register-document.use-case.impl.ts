import { randomUUID } from 'crypto';
import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IAreaHierarchyRepository } from '../core/area-hierarchy.repository';
import type { Document } from '../core/document.entity';
import { DocumentStatus } from '../core/document.entity';
import type { IDocumentRepository } from '../core/document.repository';
import type { GenerateNextCiteUseCase } from './generate-next-cite.use-case';
import type {
    IRegisterDocumentUseCase,
    RegisterDocumentInput,
} from './register-document.use-case';

export function buildTrackingCode(
    documentType: string,
    areaCode: string,
    sequenceNumber: number,
    year: number
): string {
    const formattedSequence = sequenceNumber.toString().padStart(5, '0');
    return `${documentType}/${areaCode}/${formattedSequence}-${year}`;
}

@injectable()
export class RegisterDocumentUseCase implements IRegisterDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository,
        @inject(InjectionTokens.AreaHierarchyRepository)
        private readonly areaHierarchyRepository: IAreaHierarchyRepository,
        @inject(InjectionTokens.GenerateNextCiteUseCase)
        private readonly generateNextCiteUseCase: GenerateNextCiteUseCase
    ) { }

    async execute(input: RegisterDocumentInput): Promise<Document> {
        const year = input.receptionDate.getFullYear();

        const areaCode = await this.areaHierarchyRepository.findCodeById(input.areaHierarchyId);

        if (!areaCode) {
            throw new Error(`Area hierarchy with ID ${input.areaHierarchyId} not found.`);
        }

        let trackingCode: string;
        try {
            const citeResult = await this.generateNextCiteUseCase.execute({
                organizationId: input.organizationId,
                areaId: input.areaHierarchyId,
                documentType: input.documentType,
                areaCode,
                year,
            });
            trackingCode = citeResult.citeCode;
        } catch {
            trackingCode = buildTrackingCode(input.documentType, areaCode, 1, year);
        }

        const createdDocument = await this.documentRepository.create({
            id: randomUUID(),
            organizationId: input.organizationId,
            trackingId: trackingCode,
            trackingCode,
            subject: input.subject,
            documentType: input.documentType,
            areaHierarchyId: input.areaHierarchyId,
            destinationAreaId: input.areaHierarchyId,
            receptionDate: input.receptionDate,
            status: DocumentStatus.RECIBIDO,
            downloadUrl: input.attachmentStorageKey,
        });

        return createdDocument as Document;
    }
}