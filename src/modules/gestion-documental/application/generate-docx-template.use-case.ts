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
        let doc = null;
        try {
            doc = await this.documentRepository.findDetailsById({ id: documentId, organizationId });
        } catch {
            doc = null;
        }

        if (!doc && !documentId.includes('sample') && !documentId.includes('tpl')) {
            throw new Error('Documento no encontrado o no tiene autorización para acceder.');
        }

        const citeCode = doc?.trackingCode || doc?.trackingId || (documentId.includes('sample') ? 'AEV_DNP_INF_Nro.0028-2026' : `DOC-${documentId.substring(0, 8)}`);
        const dateStr = doc?.createdAt 
            ? new Date(doc.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

        const buffer = await this.docxGeneratorService.generateTemplate({
            citeCode,
            dateStr,
            recipientName: doc?.destinationAreaName || 'Juan José Espejo (Director General)',
            recipientRole: 'Director General Ejecutivo',
            senderName: doc?.sender || 'Edwin Yujra (Jefe TIC)',
            senderRole: 'Servidor Público Responsable',
            subject: doc?.subject || 'INFORME DE EVALUACIÓN Y GESTIÓN DE CORRESPONDENCIA SIGEC',
            documentType: doc?.documentType || 'Informe',
        });

        const cleanCode = citeCode.replace(/\//g, '_');
        return { buffer, fileName: `${cleanCode}.docx` };
    }
}
