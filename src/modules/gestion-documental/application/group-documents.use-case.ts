import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

export interface GroupDocumentsDTO {
    mainDocumentId: string;
    secondaryDocumentIds: string[];
    organizationId: string;
}

@injectable()
export class GroupDocumentsUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) {}

    async execute({ mainDocumentId, secondaryDocumentIds, organizationId }: GroupDocumentsDTO): Promise<void> {
        if (!mainDocumentId) throw new Error('ID de documento principal es requerido.');
        if (!secondaryDocumentIds || secondaryDocumentIds.length === 0) {
            throw new Error('Debe seleccionar al menos un documento secundario a agrupar.');
        }
        if (!organizationId) throw new Error('ID de organización es requerido.');

        await this.documentRepository.groupDocuments({ mainDocumentId, secondaryDocumentIds, organizationId });
    }
}
