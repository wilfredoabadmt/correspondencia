import { randomUUID } from 'crypto';
import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IAreaHierarchyRepository } from '../core/area-hierarchy.repository';
import type { Document } from '../core/document.entity';
import { DocumentStatus } from '../core/document.entity';
import type { IDocumentRepository } from '../core/document.repository';
import type { GenerateNextCiteUseCase } from './generate-next-cite.use-case';

export type RegisterExternalDocumentInput = {
    organizationId: string;
    areaHierarchyId: string;
    subject: string;
    documentType: string;
    receptionDate: Date;
    attachmentStorageKey?: string | null;
    applicantIdentityDocument?: string | null;
    applicantName: string;
    applicantInstitution?: string | null;
    applicantPhone?: string | null;
    applicantEmail?: string | null;
};

@injectable()
export class RegisterExternalDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository,
        @inject(InjectionTokens.AreaHierarchyRepository)
        private readonly areaHierarchyRepository: IAreaHierarchyRepository,
        @inject(InjectionTokens.GenerateNextCiteUseCase)
        private readonly generateNextCiteUseCase: GenerateNextCiteUseCase
    ) { }

    async execute(input: RegisterExternalDocumentInput): Promise<Document> {
        const year = input.receptionDate.getFullYear();
        const areaCode = await this.areaHierarchyRepository.findCodeById(input.areaHierarchyId);

        if (!areaCode) {
            throw new Error(`Área asignada no encontrada.`);
        }

        const citeResult = await this.generateNextCiteUseCase.execute({
            organizationId: input.organizationId,
            areaId: input.areaHierarchyId,
            documentType: input.documentType,
            areaCode,
            year,
        });

        const createdDocument = await this.documentRepository.create({
            id: randomUUID(),
            organizationId: input.organizationId,
            trackingId: citeResult.citeCode,
            trackingCode: citeResult.citeCode,
            subject: input.subject,
            documentType: input.documentType,
            areaHierarchyId: input.areaHierarchyId,
            destinationAreaId: input.areaHierarchyId,
            receptionDate: input.receptionDate,
            status: DocumentStatus.RECIBIDO,
            downloadUrl: input.attachmentStorageKey || null,
            isExternal: true,
            applicantIdentityDocument: input.applicantIdentityDocument || null,
            applicantName: input.applicantName,
            applicantInstitution: input.applicantInstitution || null,
            applicantPhone: input.applicantPhone || null,
            applicantEmail: input.applicantEmail || null,
        });

        return createdDocument as Document;
    }
}
