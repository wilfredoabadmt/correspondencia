import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import { SystemShell } from '~/components/layout/SystemShell';
import { DocumentsClientView } from './_components/documents-client-view';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const user = session.user;
    const organizationId = user.organizationId;

    const listDocumentsUseCase = container.resolve<ListDocumentsUseCase>(
        InjectionTokens.ListDocumentsUseCase
    );

    const result = await listDocumentsUseCase.execute({
        organizationId,
        page: 1,
        pageSize: 50,
    }).catch(() => ({ data: [], total: 0, currentPage: 1, totalPages: 1 }));

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={organizationId}
        >
            <DocumentsClientView initialDocuments={result.data} organizationId={organizationId} />
        </SystemShell>
    );
}
