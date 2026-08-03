import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { GenerateReportUseCase } from '~/modules/gestion-documental/application/generate-report.use-case';
import { ReportFilters } from './_components/report-filters';
import { StatusSemaphoreBadge } from '~/components/document/status-semaphore-badge';
import { SystemShell } from '~/components/layout/SystemShell';

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

    const user = session.user;
    const useCase = container.resolve<GenerateReportUseCase>(
        InjectionTokens.GenerateReportUseCase
    );

    const report = await useCase.execute({
        organizationId: user.organizationId,
        status: searchParams.status,
    }).catch(() => ({
        summary: { totalDocuments: 0, pendingCount: 0, receivedCount: 0, overdueCount: 0 },
        documents: [],
    }));

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={user.organizationId}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Reportes Gerenciales y Monitoreo</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                        Consulta consolidada, análisis de atención de trámites y exportación oficial a Excel y PDF.
                    </p>
                </div>

                <ReportFilters />

                {/* Tarjetas de Resumen Gerencial */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                        <p className="text-xs font-semibold text-slate-300 uppercase">Total Trámites</p>
                        <p className="text-2xl font-extrabold text-white font-mono mt-1">{report.summary.totalDocuments}</p>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-amber-500/30">
                        <p className="text-xs font-semibold text-amber-300 uppercase">Trámites Pendientes</p>
                        <p className="text-2xl font-extrabold text-amber-300 font-mono mt-1">{report.summary.pendingCount}</p>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30">
                        <p className="text-xs font-semibold text-emerald-300 uppercase">Trámites Recepcionados</p>
                        <p className="text-2xl font-extrabold text-emerald-300 font-mono mt-1">{report.summary.receivedCount}</p>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20">
                        <p className="text-xs font-semibold text-rose-300 uppercase">Trámites en Mora (&gt; 5 días)</p>
                        <p className="text-2xl font-extrabold text-rose-400 font-mono mt-1">{report.summary.overdueCount}</p>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <div className="glass-panel-glow rounded-3xl p-6 border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-slate-800 text-slate-300 uppercase font-mono">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">N° Hoja de Ruta</th>
                                    <th className="py-3 px-4 font-semibold">Asunto</th>
                                    <th className="py-3 px-4 font-semibold">Remitente</th>
                                    <th className="py-3 px-4 font-semibold">Estado</th>
                                    <th className="py-3 px-4 font-semibold">Plazo / Días</th>
                                    <th className="py-3 px-4 font-semibold">Fecha Ingreso</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {report.documents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400">
                                            No se encontraron trámites que coincidan con los criterios de reporte.
                                        </td>
                                    </tr>
                                ) : (
                                    report.documents.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-900/60 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{doc.trackingCode}</td>
                                            <td className="py-3.5 px-4 font-medium text-slate-200">{doc.subject}</td>
                                            <td className="py-3.5 px-4 text-slate-300">{doc.sender}</td>
                                            <td className="py-3.5 px-4 text-slate-300">{doc.status}</td>
                                            <td className="py-3.5 px-4">
                                                <StatusSemaphoreBadge startDate={doc.receptionDate || doc.createdAt} />
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-400 font-mono">
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
        </SystemShell>
    );
}
