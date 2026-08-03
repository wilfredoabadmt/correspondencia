import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';
import type { IDocumentHistoryRepository } from '../core/document-history.repository';
import type { IPdfGeneratorService } from '../core/pdf-generator.service';

export interface GenerateRoutingSlipPdfDTO {
    documentId: string;
    organizationId: string;
}

@injectable()
export class GenerateRoutingSlipPdfUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository,
        @inject(InjectionTokens.DocumentHistoryRepository)
        private readonly historyRepository: IDocumentHistoryRepository,
        @inject(InjectionTokens.PdfGeneratorService)
        private readonly pdfGeneratorService: IPdfGeneratorService
    ) {}

    async execute({ documentId, organizationId }: GenerateRoutingSlipPdfDTO): Promise<{ buffer: Buffer; fileName: string }> {
        const doc = await this.documentRepository.findDetailsById({ id: documentId, organizationId });
        if (!doc) {
            throw new Error('Documento no encontrado o no tiene autorización para acceder.');
        }

        const history = await this.historyRepository.findByDocumentId(
            documentId,
            organizationId,
            50,
            0
        );

        const createdDate = doc.createdAt ? new Date(doc.createdAt) : new Date();

        const historyItems = history?.history || (history as any)?.data || [];

        const proveidos = historyItems.map((h: any, idx: number) => ({
            stepNumber: idx + 1,
            fromUser: h.fromAreaName || 'Mesa de Partes',
            toUser: h.toAreaName || 'Destinatario',
            action: h.comment || 'Para su atención',
            instructionCode: h.comment || 'PARASUATENCION',
            comment: h.comment,
            dateStr: new Date(h.createdAt).toLocaleDateString('es-PE'),
            isUrgent: false,
        }));

        const buffer = await this.pdfGeneratorService.generateRoutingSlipPdf({
            routingSlipCode: doc.trackingId || doc.trackingCode || 'HR-0001',
            citeCode: doc.trackingCode || doc.trackingId || 'CITE-0001',
            dateStr: createdDate.toLocaleDateString('es-PE'),
            timeStr: createdDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
            procedencia: 'AGENCIA ESTATAL DE VIVIENDA',
            remitente: doc.sender || 'Remitente',
            destinatario: doc.destinationAreaName || 'Destinatario',
            referencia: doc.subject || 'Sin Asunto',
            proceso: doc.documentType || 'Trámite Interno',
            adjunto: 'Documento Digitalizado PDF',
            hojas: 1,
            proveidos,
        });

        const cleanCode = (doc.trackingId || doc.trackingCode || 'HojaDeRuta').replace(/\//g, '_');
        return { buffer, fileName: `HojaDeRuta_${cleanCode}.pdf` };
    }
}
