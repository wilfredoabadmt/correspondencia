import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

export interface CancelDerivationDTO {
    documentId: string;
    userId: string;
    organizationId: string;
}

@injectable()
export class CancelDerivationUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) {}

    async execute({ documentId, userId, organizationId }: CancelDerivationDTO): Promise<void> {
        if (!documentId) throw new Error('ID de documento es requerido.');
        if (!userId) throw new Error('ID de usuario es requerido.');
        if (!organizationId) throw new Error('ID de organización es requerido.');

        await this.documentRepository.cancelDerivation({ documentId, userId, organizationId });
    }
}
