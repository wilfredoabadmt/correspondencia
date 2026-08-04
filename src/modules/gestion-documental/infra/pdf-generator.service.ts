import { injectable } from 'tsyringe';
import PDFDocument from 'pdfkit';
import type { IPdfGeneratorService, RoutingSlipPdfParams } from '../core/pdf-generator.service';

@injectable()
export class PdfGeneratorService implements IPdfGeneratorService {
    async generateRoutingSlipPdf(params: RoutingSlipPdfParams): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                margin: 36,
                size: 'LETTER',
                bufferPages: true,
            });
            const buffers: Buffer[] = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            const config = params.config;
            const institutionName = config?.institutionName || 'AGENCIA ESTATAL DE VIVIENDA';
            const subTitle = config?.subTitle || 'ESTADO PLURINACIONAL DE BOLIVIA';

            // Draw logo if provided
            let headerEndY = 55;
            if (config?.logoBuffer) {
                try {
                    doc.image(config.logoBuffer, 36, 36, { width: 60, height: 60 });
                    doc.font('Courier');
                    doc.fontSize(14).text(institutionName, 110, 40, { width: 400 });
                    doc.fontSize(9).text(subTitle, 110, 58, { width: 400 });
                    headerEndY = 105;
                } catch {
                    // If logo fails, just render text
                    doc.font('Courier');
                    doc.fontSize(14).text(institutionName, { align: 'center' });
                    doc.fontSize(9).text(subTitle, { align: 'center' });
                    headerEndY = 65;
                }
            } else {
                doc.font('Courier');
                doc.fontSize(14).text(institutionName, { align: 'center' });
                doc.fontSize(9).text(subTitle, { align: 'center' });
                headerEndY = 65;
            }

            doc.moveDown(0.5);

            // Cuadro de Hoja de Ruta
            const routeBoxY = headerEndY + 5;
            doc.rect(36, routeBoxY, 540, 40).stroke();
            doc.fontSize(12).text(`HOJA DE RUTA INTERNA / EXTERNA: ${params.routingSlipCode}`, 45, routeBoxY + 13);
            doc.fontSize(9).text(`FECHA: ${params.dateStr}  HORA: ${params.timeStr}`, 380, routeBoxY + 13);

            // Cuadro de Metadatos del Trámite
            let startY = routeBoxY + 50;
            doc.rect(36, startY, 540, 110).stroke();
            doc.fontSize(9).text('PROCEDENCIA: ' + params.procedencia, 45, startY + 8);
            doc.fontSize(9).text('REMITENTE: ' + params.remitente, 45, startY + 24);
            doc.fontSize(9).text('DESTINATARIO: ' + params.destinatario, 45, startY + 40);
            doc.fontSize(9).text('REFERENCIA: ' + params.referencia, 45, startY + 56, { width: 430 });
            doc.fontSize(9).text('PROCESO: ' + params.proceso, 45, startY + 88);
            doc.fontSize(9).text('HOJAS: ' + params.hojas, 380, startY + 88);

            // Grilla de Proveídos
            startY += 120;
            const proveidoBoxHeight = 150;

            const proveidosToRender = params.proveidos.length > 0 ? params.proveidos : [
                { stepNumber: 1, fromUser: '', toUser: '', action: '', dateStr: '', isUrgent: false }
            ];

            proveidosToRender.forEach((p, idx) => {
                const currentY = startY + (idx * (proveidoBoxHeight + 10));
                if (currentY + proveidoBoxHeight > 750) {
                    doc.addPage();
                }

                doc.rect(36, currentY, 540, proveidoBoxHeight).stroke();
                doc.fontSize(10).text(`Proveído N°: ${p.stepNumber || idx + 1}`, 45, currentY + 8);

                const options = ['ATENCION URGENTE', 'ELABORAR INFORME', 'ELABORAR RESPUESTA', 'PARA SU CONSIDERACION', 'PARA SU CONOCIMIENTO', 'PARA V°B°', 'ARCHIVAR', 'OTRO'];
                let optX = 45;
                let optY = currentY + 25;
                options.forEach((opt, oIdx) => {
                    const isChecked = p.instructionCode === opt || (opt === 'ATENCION URGENTE' && p.isUrgent);
                    doc.rect(optX, optY, 8, 8).stroke();
                    if (isChecked) {
                        doc.fontSize(7).text('X', optX + 2, optY + 1);
                    }
                    doc.fontSize(7).text(opt, optX + 11, optY + 1);
                    optX += 130;
                    if ((oIdx + 1) % 4 === 0) {
                        optX = 45;
                        optY += 12;
                    }
                });

                doc.rect(45, currentY + 55, 330, 85).stroke();
                if (p.comment) {
                    doc.fontSize(8).text(p.comment, 50, currentY + 60, { width: 320 });
                }

                doc.rect(385, currentY + 55, 180, 85).stroke();
                doc.fontSize(8).text('Sello Recibido', 435, currentY + 60);
                doc.fontSize(8).text('Fecha: _______________', 395, currentY + 115);
                doc.fontSize(8).text('Hora: _______________', 395, currentY + 127);
            });

            doc.end();
        });
    }
}
