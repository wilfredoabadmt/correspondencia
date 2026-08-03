import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';
import type { IDocxGeneratorService } from '../core/docx-generator.service';

export interface GenerateDocxTemplateDTO {
    documentId: string;
    organizationId: string;
}

@injectable()
export class GenerateDocxTemplateUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository,
        @inject(InjectionTokens.DocxGeneratorService)
        private readonly docxGeneratorService: IDocxGeneratorService
    ) {}

    async execute({ documentId, organizationId }: GenerateDocxTemplateDTO): Promise<{ buffer: Buffer; fileName: string }> {
        const doc = await this.documentRepository.findDetailsById({ id: documentId, organizationId });
        if (!doc) {
            throw new Error('Documento no encontrado o no tiene autorización para acceder.');
        }

        const dateStr = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        const buffer = await this.docxGeneratorService.generateTemplate({
            citeCode: doc.trackingCode || doc.trackingId || 'SN',
            dateStr,
            recipientName: doc.destinationAreaName || 'Destinatario Principal',
            recipientRole: 'Cargo Destinatario',
            senderName: doc.sender || 'Remitente',
            senderRole: 'Cargo Remitente',
            subject: doc.subject || 'Sin Asunto',
            documentType: doc.documentType || 'Informe',
        });

        const cleanCode = (doc.trackingCode || doc.trackingId || 'Plantilla').replace(/\//g, '_');
        return { buffer, fileName: `${cleanCode}.docx` };
    }
}
