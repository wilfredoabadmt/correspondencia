import 'reflect-metadata';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { container, InjectionTokens } from '~/core/container';
import { GetDashboardDataUseCase } from '~/modules/dashboard/application/get-dashboard-data.use-case';
import { auth } from '~/modules/auth/lib/auth';
import { OverdueNotificationModal } from '~/components/dashboard/overdue-notification-modal';
import { SystemShell } from '~/components/layout/SystemShell';
import type { IDocumentRepository } from '~/modules/gestion-documental/core/document.repository';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const user = session.user;
    const organizationId = user.organizationId;

    const getDashboardDataUseCase = container.resolve<GetDashboardDataUseCase>(
        InjectionTokens.GetDashboardDataUseCase
    );

    const docRepo = container.resolve<IDocumentRepository>(InjectionTokens.DocumentRepository);

    const [{ kpis, recentDocuments }, pendingDocsResult] = await Promise.all([
        getDashboardDataUseCase.execute({ organizationId }).catch(() => ({
            kpis: { documentsToday: 0, pendingDocuments: 0, totalDocuments: 0, overdueDocuments: 0 },
            recentDocuments: [],
        })),
        docRepo.findMany({ organizationId, page: 1, pageSize: 100, status: 'Recibido' }).catch(() => ({ data: [] })),
    ]);

    const fiveDaysAgoMs = 5 * 24 * 60 * 60 * 1000;
    const overdueDocs = (pendingDocsResult?.data || []).filter((doc) => {
        const start = doc.receptionDate ? new Date(doc.receptionDate).getTime() : doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
        return (Date.now() - start) >= fiveDaysAgoMs;
    });

    const isSuperAdminOrAdmin = user.role === 'SUPERADMIN' || user.role === 'ADMINISTRADOR';

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={organizationId}
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Modal for Overdue Notifications */}
                <OverdueNotificationModal overdueDocuments={overdueDocs} />

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-white">Dashboard SIGEC</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                                user.role === 'SUPERADMIN' 
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : user.role === 'ADMINISTRADOR'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1">
                            Sesión activa: <span className="text-white font-semibold">{user.name}</span> ({user.email})
                        </p>
                    </div>

                    {/* Navigation Quick Actions */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {isSuperAdminOrAdmin && (
                            <Link
                                href="/admin/roles"
                                className="px-4 py-2.5 rounded-xl font-bold text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5"
                            >
                                <span>🛡️ Roles por Oficina</span>
                            </Link>
                        )}

                        <Link
                            href="/inbox/pending"
                            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
                        >
                            <span>⏳ Atender Pendientes</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/30 transition-all">
                        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Documentos Hoy</div>
                        <div className="text-4xl font-extrabold text-white font-mono mt-3 text-gradient-cyan">
                            {kpis.documentsToday}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-2">Registrados en la jornada</div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-blue-500/30 transition-all">
                        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Documentos Pendientes</div>
                        <div className="text-4xl font-extrabold text-cyan-300 font-mono mt-3">
                            {kpis.pendingDocuments}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-2">En espera de respuesta / derivación</div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all">
                        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Documentos</div>
                        <div className="text-4xl font-extrabold text-indigo-300 font-mono mt-3">
                            {kpis.totalDocuments}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-2">Procesados en la organización</div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-rose-950/20 shadow-lg shadow-rose-950/30">
                        <div className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Trámites en Mora (&gt; 5 días)</div>
                        <div className="text-4xl font-extrabold text-rose-400 font-mono mt-3">
                            {kpis.overdueDocuments}
                        </div>
                        <div className="text-[11px] text-rose-300/80 mt-2">Requieren justificación urgente</div>
                    </div>
                </div>

                {/* Recent Documents Table Section */}
                <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Documentos Recientes en Bandeja</h2>
                            <p className="text-xs text-slate-300 mt-1">Hojas de ruta y trámites asignados a su unidad de correspondencia</p>
                        </div>

                        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                            Organización: {organizationId}
                        </span>
                    </div>

                    {recentDocuments.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 space-y-2">
                            <div className="text-3xl">📭</div>
                            <div className="text-sm font-semibold text-slate-200">No hay documentos recientes registrados</div>
                            <p className="text-xs text-slate-400">Los nuevos trámites o derivaciones aparecerán automáticamente en esta tabla.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-300 font-mono uppercase tracking-wider">
                                        <th className="py-3 px-4 font-semibold">CITE / N° Seguimiento</th>
                                        <th className="py-3 px-4 font-semibold">Asunto</th>
                                        <th className="py-3 px-4 font-semibold">Fecha de Recepción</th>
                                        <th className="py-3 px-4 font-semibold text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {recentDocuments.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-900/60 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{doc.trackingId}</td>
                                            <td className="py-3.5 px-4 font-medium text-slate-200">{doc.subject}</td>
                                            <td className="py-3.5 px-4 text-slate-400 font-mono">
                                                {new Date(doc.receptionDate).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link
                                                    href={`/documents/${doc.id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 transition-all inline-block"
                                                >
                                                    Ver Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </SystemShell>
    );
}
