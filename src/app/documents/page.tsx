import 'reflect-metadata';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListDocumentsUseCase } from '~/modules/gestion-documental/application/list-documents.use-case';
import type { ListUsersUseCase } from '~/modules/users/application/list-users.use-case';
import type { ListAreasUseCase } from '~/modules/gestion-documental/application/list-areas.use-case.impl';
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
    const listUsersUseCase = container.resolve<ListUsersUseCase>(
        InjectionTokens.ListUsersUseCase
    );
    const listAreasUseCase = container.resolve<ListAreasUseCase>(
        InjectionTokens.ListAreasUseCase
    );

    const [docsResult, usersResult, areasResult] = await Promise.all([
        listDocumentsUseCase.execute({
            organizationId,
            page: 1,
            pageSize: 50,
        }).catch(() => ({ data: [], total: 0, currentPage: 1, totalPages: 1 })),
        listUsersUseCase.execute({
            organizationId,
            userId: user.id,
            userRole: user.role || 'SUPERADMIN',
        }).catch(() => []),
        listAreasUseCase.execute({
            organizationId,
        }).catch(() => []),
    ]);

    const usersList = Array.isArray(usersResult) ? usersResult : [];
    const areasList = Array.isArray(areasResult) ? areasResult : [];

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={organizationId}
        >
            <DocumentsClientView
                initialDocuments={docsResult.data}
                organizationId={organizationId}
                systemUsers={usersList}
                systemAreas={areasList}
            />
        </SystemShell>
    );
}
