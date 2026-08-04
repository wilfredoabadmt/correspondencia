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
            const institutionName = config?.institutionName || 'AGENCIA ESTATAL DE VIVIENDA - AEVIVIENDA';
            const subTitle = config?.subTitle || 'MINISTERIO DE OBRAS PÚBLICAS, SERVICIOS Y VIVIENDA';

            const startX = 36;
            const pageWidth = 540; // Letter width 612 - 72 margins
            let headerEndY = 100;

            // Draw logo if provided
            if (config?.logoBuffer) {
                try {
                    doc.image(config.logoBuffer, startX, 36, { fit: [60, 60] });
                } catch {
                    // Fallback logo box
                    doc.rect(startX, 36, 60, 60).fillAndStroke('#0284c7', '#0369a1');
                    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('LOGO', startX + 15, 60);
                }
            } else {
                // Vector Logo Box
                doc.roundedRect(startX, 36, 55, 55, 6).fillAndStroke('#0284c7', '#0369a1');
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('LOGO', startX + 15, 58);
            }

            // Header Center Titles
            const centerLeft = startX + 70;
            const centerWidth = 330;

            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(institutionName.toUpperCase(), centerLeft, 40, { width: centerWidth, align: 'center' });
            doc.fillColor('#475569').font('Helvetica').fontSize(8).text(subTitle.toUpperCase(), centerLeft, 55, { width: centerWidth, align: 'center' });
            doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(10).text('HOJA DE RUTA OFICIAL DE SEGUIMIENTO', centerLeft, 70, { width: centerWidth, align: 'center' });

            // Right Box: Tracking & Date
            const rightX = startX + 410;
            doc.fillColor('#be123c').font('Helvetica-Bold').fontSize(11).text(`N° ${params.routingSlipCode}`, rightX, 42, { width: 130, align: 'right' });
            doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(params.dateStr, rightX, 58, { width: 130, align: 'right' });

            // Header Divider Line
            headerEndY = 102;
            doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(startX, headerEndY).lineTo(startX + pageWidth, headerEndY).stroke();

            // CITE Box
            const citeY = headerEndY + 8;
            doc.roundedRect(startX, citeY, pageWidth, 28, 4).fillAndStroke('#f8fafc', '#e2e8f0');
            doc.fillColor('#475569').font('Helvetica').fontSize(8).text('CITE / Nomenclatura Oficial:', startX + 10, citeY + 9);
            doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9).text(params.citeCode, startX + 140, citeY + 9);

            // Cuadro de Metadatos del Trámite
            let startY = citeY + 36;
            const metaBoxHeight = 110;
            doc.roundedRect(startX, startY, pageWidth, metaBoxHeight, 6).strokeColor('#94a3b8').lineWidth(1).stroke();

            doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('PROCEDENCIA:', startX + 10, startY + 10);
            doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(params.procedencia, startX + 95, startY + 10);

            doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('REMITENTE:', startX + 10, startY + 26);
            doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(params.remitente, startX + 95, startY + 26);

            doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('DESTINATARIO:', startX + 10, startY + 42);
            doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(params.destinatario, startX + 95, startY + 42);

            doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('REFERENCIA:', startX + 10, startY + 58);
            doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(params.referencia, startX + 95, startY + 58, { width: 430 });

            doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('PROCESO:', startX + 10, startY + 90);
            doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(params.proceso, startX + 95, startY + 90);

            doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8).text('HOJAS:', startX + 410, startY + 90);
            doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(String(params.hojas), startX + 455, startY + 90);

            // Grilla de Proveídos
            startY += metaBoxHeight + 12;
            const proveidoBoxHeight = 145;

            const proveidosToRender = params.proveidos.length > 0 ? params.proveidos : [
                { stepNumber: 1, fromUser: '', toUser: '', action: '', dateStr: '', isUrgent: false }
            ];

            proveidosToRender.forEach((p, idx) => {
                const currentY = startY + (idx * (proveidoBoxHeight + 10));
                if (currentY + proveidoBoxHeight > 750) {
                    doc.addPage();
                }

                doc.roundedRect(startX, currentY, pageWidth, proveidoBoxHeight, 6).strokeColor('#cbd5e1').stroke();
                doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(`Proveído N° ${p.stepNumber || idx + 1}`, startX + 10, currentY + 8);

                const options = ['ATENCION URGENTE', 'ELABORAR INFORME', 'ELABORAR RESPUESTA', 'PARA SU CONSIDERACION', 'PARA SU CONOCIMIENTO', 'PARA V°B°', 'ARCHIVAR', 'OTRO'];
                let optX = startX + 10;
                let optY = currentY + 24;
                options.forEach((opt, oIdx) => {
                    const isChecked = p.instructionCode === opt || (opt === 'ATENCION URGENTE' && p.isUrgent);
                    doc.rect(optX, optY, 8, 8).strokeColor('#475569').stroke();
                    if (isChecked) {
                        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7).text('X', optX + 2, optY + 1);
                    }
                    doc.fillColor('#334155').font('Helvetica').fontSize(7).text(opt, optX + 11, optY + 1);
                    optX += 130;
                    if ((oIdx + 1) % 4 === 0) {
                        optX = startX + 10;
                        optY += 12;
                    }
                });

                // Comment box
                doc.roundedRect(startX + 10, currentY + 52, 330, 82, 4).strokeColor('#e2e8f0').stroke();
                doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7).text('INSTRUCCIÓN / COMERCIO / OBSERVACIÓN:', startX + 15, currentY + 56);
                if (p.comment) {
                    doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(p.comment, startX + 15, currentY + 68, { width: 320 });
                }

                // Signature / Stamp box
                doc.roundedRect(startX + 350, currentY + 52, 180, 82, 4).strokeColor('#e2e8f0').stroke();
                doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8).text('Sello Recibido', startX + 405, currentY + 58);
                doc.fillColor('#64748b').font('Helvetica').fontSize(7).text('Fecha: _______________', startX + 360, currentY + 108);
                doc.fillColor('#64748b').font('Helvetica').fontSize(7).text('Hora: _______________', startX + 360, currentY + 120);
            });

            doc.end();
        });
    }
}
