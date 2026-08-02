import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type { IStorageService } from '@/modules/storage/core/storage.service';
import type { DocumentWithArea, IDocumentRepository } from '../core/document.repository';

type GetDocumentDetailsUseCaseParams = {
    documentId: string;
    organizationId: string;
};

export type GetDocumentDetailsUseCaseResult = DocumentWithArea & {
    downloadUrl: string | null;
};

@injectable()
export class GetDocumentDetailsUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository,
        @inject(InjectionTokens.StorageService)
        private readonly storageService: IStorageService
    ) { }

    async execute({
        documentId,
        organizationId,
    }: GetDocumentDetailsUseCaseParams): Promise<GetDocumentDetailsUseCaseResult | null> {
        const document = await this.documentRepository.findDetailsById({
            id: documentId,
            organizationId,
        });

        if (!document) {
            return null;
        }

        const downloadUrl = document.fileKey
            ? await this.storageService.getDownloadUrl(document.fileKey)
            : null;

        return { ...document, downloadUrl };
    }
}