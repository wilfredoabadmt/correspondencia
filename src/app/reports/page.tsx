import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { GenerateReportUseCase } from '~/modules/gestion-documental/application/generate-report.use-case';
import { ReportFilters } from './_components/report-filters';
import { StatusSemaphoreBadge } from '~/components/document/status-semaphore-badge';

export const dynamic = 'force-dynamic';

interface ReportsPageProps {
    searchParams: {
        status?: string;
    };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const useCase = container.resolve<GenerateReportUseCase>(
        InjectionTokens.GenerateReportUseCase
    );

    const report = await useCase.execute({
        organizationId: session.user.organizationId,
        status: searchParams.status,
    });

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reportes Gerenciales y Monitoreo</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Consulta consolidada, análisis de atención de trámites y exportación oficial a Excel y PDF.
                </p>
            </div>

            <ReportFilters />

            {/* Tarjetas de Resumen Gerencial */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-lg border shadow-sm">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total Trámites</p>
                    <p className="text-2xl font-bold mt-1">{report.summary.totalDocuments}</p>
                </div>
                <div className="bg-card p-5 rounded-lg border shadow-sm">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Trámites Pendientes</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{report.summary.pendingCount}</p>
                </div>
                <div className="bg-card p-5 rounded-lg border shadow-sm">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Trámites Recepcionados</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{report.summary.receivedCount}</p>
                </div>
                <div className="bg-card p-5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm">
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">Trámites en Mora (&gt; 5 días)</p>
                    <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">{report.summary.overdueCount}</p>
                </div>
            </div>

            {/* Tabla de Resultados */}
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="py-3 px-4 font-semibold">N° Hoja de Ruta</th>
                                <th className="py-3 px-4 font-semibold">Asunto</th>
                                <th className="py-3 px-4 font-semibold">Remitente</th>
                                <th className="py-3 px-4 font-semibold">Estado</th>
                                <th className="py-3 px-4 font-semibold">Plazo / Días</th>
                                <th className="py-3 px-4 font-semibold">Fecha Ingreso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {report.documents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No se encontraron trámites que coincidan con los criterios de reporte.
                                    </td>
                                </tr>
                            ) : (
                                report.documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4 font-mono font-medium">{doc.trackingCode}</td>
                                        <td className="py-3 px-4 font-medium">{doc.subject}</td>
                                        <td className="py-3 px-4">{doc.sender}</td>
                                        <td className="py-3 px-4">{doc.status}</td>
                                        <td className="py-3 px-4">
                                            <StatusSemaphoreBadge startDate={doc.receptionDate || doc.createdAt} />
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('es-PE') : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
