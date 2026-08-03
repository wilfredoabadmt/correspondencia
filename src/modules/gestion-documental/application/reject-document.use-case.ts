import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

export interface RejectDocumentDTO {
    documentId: string;
    userId: string;
    reason: string;
    organizationId: string;
}

@injectable()
export class RejectDocumentUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) {}

    async execute({ documentId, userId, reason, organizationId }: RejectDocumentDTO): Promise<void> {
        if (!documentId) throw new Error('ID de documento es requerido.');
        if (!userId) throw new Error('ID de usuario es requerido.');
        if (!reason || reason.trim() === '') throw new Error('El motivo de rechazo es obligatorio.');
        if (!organizationId) throw new Error('ID de organización es requerido.');

        await this.documentRepository.rejectDocument({ documentId, userId, reason, organizationId });
    }
}
