import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import { PendingInboxTable } from './_components/pending-inbox-table';

export const dynamic = 'force-dynamic';

export default async function PendingInboxPage() {
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
        status: 'RECIBIDO',
    });

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Correspondencia Pendiente</h1>
                <p className="text-muted-foreground mt-1">
                    Documentos bajo tu responsabilidad y custodia activa. Puedes derivar, justificar atrasos, agrupar o archivar.
                </p>
            </div>

            <PendingInboxTable documents={documents} />
        </div>
    );
}
