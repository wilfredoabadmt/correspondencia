import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { GenerateReportUseCase } from '~/modules/gestion-documental/application/generate-report.use-case';
import type { IExcelExporterService } from '~/modules/gestion-documental/core/excel-exporter.service';

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
        const excelService = container.resolve<IExcelExporterService>(
            InjectionTokens.ExcelExporterService
        );

        const report = await useCase.execute({
            organizationId: session.user.organizationId,
            status,
        });

        const buffer = await excelService.generateReportSpreadsheet({
            organizationName: 'AGENCIA ESTATAL DE VIVIENDA',
            documents: report.documents.map((d) => ({
                trackingCode: d.trackingCode,
                subject: d.subject,
                sender: d.sender,
                destinationAreaName: d.destinationAreaName,
                status: d.status,
                documentType: d.documentType,
                receptionDateStr: d.receptionDate ? new Date(d.receptionDate).toLocaleDateString('es-PE') : '-',
                daysElapsed: d.daysElapsed,
            })),
            summary: report.summary,
        });

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="Reporte_Correspondencia_${Date.now()}.xlsx"`,
            },
        });
    } catch (err: any) {
        return new NextResponse(err.message || 'Error al exportar reporte Excel', { status: 400 });
    }
}
