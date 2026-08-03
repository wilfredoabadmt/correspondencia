import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import { SentInboxTable } from './_components/sent-inbox-table';

export const dynamic = 'force-dynamic';

export default async function SentInboxPage() {
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
    });

    const sentDocuments = documents.filter(d => d.status === 'PENDIENTE_RECEPCION' || d.status === 'RECIBIDO');

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Correspondencia Enviada</h1>
                <p className="text-muted-foreground mt-1">
                    Trámites derivados. Puedes cancelar la derivación únicamente si el destinatario no ha recepcionado aún.
                </p>
            </div>

            <SentInboxTable documents={sentDocuments} />
        </div>
    );
}
