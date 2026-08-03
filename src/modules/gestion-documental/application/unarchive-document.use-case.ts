import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

export interface UnarchiveDocumentDTO {
    documentId: string;
    organizationId: string;
}

@injectable()
export class UnarchiveDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) {}

    async execute({ documentId, organizationId }: UnarchiveDocumentDTO): Promise<void> {
        if (!documentId) throw new Error('ID de documento es requerido.');
        if (!organizationId) throw new Error('ID de organización es requerido.');

        await this.documentRepository.unarchiveDocument({ documentId, organizationId });
    }
}
