import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

export interface JustifyDelayDTO {
    documentId: string;
    userId: string;
    reason: string;
    organizationId: string;
}

@injectable()
export class JustifyDelayUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) {}

    async execute({ documentId, userId, reason, organizationId }: JustifyDelayDTO): Promise<void> {
        if (!documentId) throw new Error('ID de documento es requerido.');
        if (!userId) throw new Error('ID de usuario es requerido.');
        if (!reason || reason.trim() === '') throw new Error('El motivo de justificación es obligatorio.');
        if (!organizationId) throw new Error('ID de organización es requerido.');

        await this.documentRepository.justifyDelay({ documentId, userId, reason, organizationId });
    }
}
