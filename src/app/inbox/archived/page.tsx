import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import { ArchivedInboxTable } from './_components/archived-inbox-table';

export const dynamic = 'force-dynamic';

export default async function ArchivedInboxPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const listDocumentsUseCase = container.resolve<ListDocumentsUseCase>(
        InjectionTokens.ListDocumentsUseCase
    );

    const { data: documents } = await listDocumentsUseCase.execute({
        organizationId: session.user.organizationId,
        page: 1,
        pageSize: 50,
        status: 'ARCHIVADO',
    });

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Correspondencia Archivada</h1>
                <p className="text-muted-foreground mt-1">
                    Trámites concluidos y almacenados en carpetas de custodia. Puedes devolver un trámite a pendientes mediante "Quitar de archivo".
                </p>
            </div>

            <ArchivedInboxTable documents={documents} />
        </div>
    );
}
