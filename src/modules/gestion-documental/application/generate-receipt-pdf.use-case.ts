import { inject, injectable } from 'tsyringe';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IDocumentRepository } from '../core/document.repository';

@injectable()
export class GenerateReceiptPdfUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) { }

    async execute({ documentId, organizationId }: { documentId: string; organizationId: string }): Promise<Buffer> {
        const doc = await this.documentRepository.findDetailsById({
            id: documentId,
            organizationId,
        });

        if (!doc) {
            throw new Error('Documento no encontrado o sin permisos.');
        }

        const baseUrl = process.env.COOLIFY_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://correspondencia.89.116.29.168.sslip.io';
        const trackingUrl = `${baseUrl}/seguimiento?codigo=${encodeURIComponent(doc.trackingCode || '')}`;
        const qrBuffer = await QRCode.toBuffer(trackingUrl, { width: 140, margin: 1 });

        return new Promise((resolve, reject) => {
            const pdfDoc = new PDFDocument({ size: 'A5', margin: 30, layout: 'landscape' });
            const chunks: Buffer[] = [];

            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));

            // Header Banner
            pdfDoc.rect(0, 0, pdfDoc.page.width, 45).fill('#1e1b4b');
            pdfDoc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('COMPROBANTE DE RECEPCIÓN DE VENTANILLA ÚNICA', 30, 15, { align: 'center' });

            pdfDoc.fillColor('#334155').fontSize(10).font('Helvetica-Bold').text(`CITE / Código de Seguimiento: ${doc.trackingCode}`, 30, 60);

            // Document Details
            pdfDoc.fontSize(9).font('Helvetica');
            pdfDoc.text(`Fecha de Recepción: ${doc.receptionDate ? new Date(doc.receptionDate).toLocaleString('es-BO') : 'N/A'}`, 30, 80);
            pdfDoc.text(`Asunto: ${doc.subject}`, 30, 95);
            pdfDoc.text(`Tipo de Documento: ${doc.documentType}`, 30, 110);
            pdfDoc.text(`Área de Destino: ${doc.destinationAreaName || 'Mesa de Partes'}`, 30, 125);

            // Applicant Info
            pdfDoc.font('Helvetica-Bold').text('Datos del Solicitante / Remitente:', 30, 145);
            pdfDoc.font('Helvetica');
            pdfDoc.text(`Nombre: ${doc.applicantName || doc.sender || 'Externo'}`, 30, 160);
            pdfDoc.text(`CI / NIT: ${doc.applicantIdentityDocument || 'N/A'}`, 30, 175);
            pdfDoc.text(`Institución: ${doc.applicantInstitution || 'Particular'}`, 30, 190);
            pdfDoc.text(`Teléfono / Correo: ${doc.applicantPhone || 'N/A'} / ${doc.applicantEmail || 'N/A'}`, 30, 205);

            // QR Code at the right side
            pdfDoc.image(qrBuffer, pdfDoc.page.width - 170, 70, { width: 130 });
            pdfDoc.fontSize(7).fillColor('#64748b').text('Escanee para seguimiento público en línea', pdfDoc.page.width - 180, 210, { align: 'center', width: 150 });

            // Footer
            pdfDoc.fontSize(8).fillColor('#475569').text('Este comprobante certifica el ingreso oficial del trámite en la institución.', 30, pdfDoc.page.height - 30, { align: 'center' });

            pdfDoc.end();
        });
    }
}
