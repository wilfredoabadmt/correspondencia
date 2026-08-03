import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

export interface ArchiveDocumentDTO {
    documentId: string;
    folderCategory: string;
    observations?: string | null;
    organizationId: string;
}

@injectable()
export class ArchiveDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) {}

    async execute({ documentId, folderCategory, observations = null, organizationId }: ArchiveDocumentDTO): Promise<void> {
        if (!documentId) throw new Error('ID de documento es requerido.');
        if (!folderCategory || folderCategory.trim() === '') throw new Error('La carpeta de destino es obligatoria.');
        if (!organizationId) throw new Error('ID de organización es requerido.');

        await this.documentRepository.archiveDocument({
            documentId,
            folderCategory,
            observations,
            organizationId,
        });
    }
}
