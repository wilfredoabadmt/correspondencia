import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { GenerateReportUseCase } from '~/modules/gestion-documental/application/generate-report.use-case';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return new NextResponse('No autorizado', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
        const useCase = container.resolve<GenerateReportUseCase>(
            InjectionTokens.GenerateReportUseCase
        );

        const report = await useCase.execute({
            organizationId: session.user.organizationId,
            status,
        });

        const buffer = await new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument({ margin: 36, size: 'LETTER' });
            const buffers: Buffer[] = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            doc.fontSize(14).font('Courier-Bold').text('AGENCIA ESTATAL DE VIVIENDA', { align: 'center' });
            doc.fontSize(12).font('Courier-Bold').text('REPORTE GERENCIAL DE CORRESPONDENCIA', { align: 'center' });
            doc.fontSize(9).font('Courier').text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-PE')}`, { align: 'center' });
            doc.moveDown(1);

            // Resumen de Totales
            doc.rect(36, 110, 540, 30).stroke();
            doc.fontSize(9).font('Courier-Bold').text(`Total: ${report.summary.totalDocuments}  |  Pendientes: ${report.summary.pendingCount}  |  En Mora (> 5 días): ${report.summary.overdueCount}`, 45, 120);

            // Tabla de Registros
            let startY = 155;
            doc.fontSize(8).font('Courier-Bold');
            doc.text('CÓDIGO', 40, startY);
            doc.text('ASUNTO', 140, startY);
            doc.text('ESTADO', 380, startY);
            doc.text('DÍAS', 480, startY);

            doc.moveTo(36, startY + 12).lineTo(576, startY + 12).stroke();

            let currentY = startY + 20;
            report.documents.forEach((d) => {
                if (currentY > 720) {
                    doc.addPage();
                    currentY = 40;
                }
                doc.fontSize(8).font('Courier');
                doc.text(d.trackingCode, 40, currentY);
                doc.text(d.subject, 140, currentY, { width: 230 });
                doc.text(d.status, 380, currentY);
                doc.text(`${d.daysElapsed} días`, 480, currentY);
                currentY += 18;
            });

            doc.end();
        });

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Reporte_Gerencial_${Date.now()}.pdf"`,
            },
        });
    } catch (err: any) {
        return new NextResponse(err.message || 'Error al generar reporte PDF', { status: 400 });
    }
}
