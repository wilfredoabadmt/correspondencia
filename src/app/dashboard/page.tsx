import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { GetDashboardDataUseCase } from '~/modules/dashboard/application/get-dashboard-data.use-case';
import { auth } from '~/modules/auth/lib/auth';
import { OverdueNotificationModal } from '~/components/dashboard/overdue-notification-modal';
import type { IDocumentRepository } from '~/modules/gestion-documental/core/document.repository';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const organizationId = session.user.organizationId;
    const getDashboardDataUseCase = container.resolve<GetDashboardDataUseCase>(
        InjectionTokens.GetDashboardDataUseCase
    );

    const docRepo = container.resolve<IDocumentRepository>(InjectionTokens.DocumentRepository);

    const [{ kpis, recentDocuments }, pendingDocsResult] = await Promise.all([
        getDashboardDataUseCase.execute({ organizationId }),
        docRepo.findMany({ organizationId, page: 1, pageSize: 100, status: 'Recibido' }),
    ]);

    const fiveDaysAgoMs = 5 * 24 * 60 * 60 * 1000;
    const overdueDocs = pendingDocsResult.data.filter((doc) => {
        const start = doc.receptionDate ? new Date(doc.receptionDate).getTime() : doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
        return (Date.now() - start) >= fiveDaysAgoMs;
    });

    return (
        <div className="container mx-auto py-10 space-y-8">
            <OverdueNotificationModal overdueDocuments={overdueDocs} />

            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h2 className="text-sm font-medium text-muted-foreground">Documentos Hoy</h2>
                    <p className="text-3xl font-bold mt-2">{kpis.documentsToday}</p>
                </div>
                <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h2 className="text-sm font-medium text-muted-foreground">Documentos Pendientes</h2>
                    <p className="text-3xl font-bold mt-2">{kpis.pendingDocuments}</p>
                </div>
                <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h2 className="text-sm font-medium text-muted-foreground">Total Documentos</h2>
                    <p className="text-3xl font-bold mt-2">{kpis.totalDocuments}</p>
                </div>
                <div className="bg-card p-6 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm">
                    <h2 className="text-sm font-medium text-rose-700 dark:text-rose-400">Trámites en Mora (&gt; 5 días)</h2>
                    <p className="text-3xl font-bold mt-2 text-rose-700 dark:text-rose-400">{kpis.overdueDocuments}</p>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Documentos Recientes</h2>
                {recentDocuments.length === 0 ? (
                    <p className="text-muted-foreground">No hay documentos recientes.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">N° de Seguimiento</th>
                                    <th className="text-left py-3 px-4 font-medium">Asunto</th>
                                    <th className="text-left py-3 px-4 font-medium">Fecha de Recepción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDocuments.map((doc) => (
                                    <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="py-3 px-4">{doc.trackingId}</td>
                                        <td className="py-3 px-4">{doc.subject}</td>
                                        <td className="py-3 px-4">
                                            {new Date(doc.receptionDate).toLocaleDateString('es-PE')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
