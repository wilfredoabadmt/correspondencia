import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import { ArchivedInboxTable } from './_components/archived-inbox-table';
import { SystemShell } from '~/components/layout/SystemShell';

export const dynamic = 'force-dynamic';

export default async function ArchivedInboxPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const user = session.user;
    const listDocumentsUseCase = container.resolve<ListDocumentsUseCase>(
        InjectionTokens.ListDocumentsUseCase
    );

    const { data: documents } = await listDocumentsUseCase.execute({
        organizationId: user.organizationId,
        page: 1,
        pageSize: 50,
        status: 'ARCHIVADO',
    }).catch(() => ({ data: [] }));

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={user.organizationId}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Correspondencia Archivada</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                        Trámites concluidos y almacenados en carpetas de custodia. Puede devolver un trámite a pendientes mediante "Quitar de archivo".
                    </p>
                </div>

                <ArchivedInboxTable documents={documents} />
            </div>
        </SystemShell>
    );
}
