import { inject, injectable } from 'tsyringe';
import type { IDocumentHistoryRepository, PaginatedHistory } from '../core/document-history.repository';
import { InjectionTokens } from '~/core/injection-tokens';

export type GetDocumentHistoryUseCaseRequest = {
    documentId: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
    userId?: string;
    userRole?: string;
};

@injectable()
export class GetDocumentHistoryUseCase {
    private readonly AUTHORIZED_ROLES = ['OPERADOR', 'ADMINISTRADOR'];

    constructor(
        @inject(InjectionTokens.DocumentHistoryRepository)
        private readonly documentHistoryRepository: IDocumentHistoryRepository,
    ) { }

    async execute({
        documentId,
        organizationId = '',
        limit = 10,
        offset = 0,
        userRole = 'OPERADOR',
    }: GetDocumentHistoryUseCaseRequest): Promise<PaginatedHistory> {
        if (userRole && !this.AUTHORIZED_ROLES.includes(userRole)) {
            throw new Error(`Forbidden: User with role '${userRole}' is not authorized to view document history.`);
        }

        if (limit <= 0 || offset < 0) {
            throw new Error('Limit must be positive and offset must be non-negative.');
        }

        return this.documentHistoryRepository.findByDocumentId(documentId, organizationId, limit, offset);
    }
}