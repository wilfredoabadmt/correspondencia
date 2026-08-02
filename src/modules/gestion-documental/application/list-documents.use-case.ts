import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type {
    Document,
    FindManyDocumentsParams,
    IDocumentRepository,
} from '../core/document.repository';

export type ListDocumentsResult = {
    data: Document[];
    total: number;
    currentPage: number;
    totalPages: number;
};

@injectable()
export class ListDocumentsUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) { }

    async execute(params: FindManyDocumentsParams): Promise<ListDocumentsResult> {
        const { data, total } = await this.documentRepository.findMany(params);

        const totalPages = Math.ceil(total / params.pageSize);

        return {
            data,
            total,
            currentPage: params.page,
            totalPages,
        };
    }
}