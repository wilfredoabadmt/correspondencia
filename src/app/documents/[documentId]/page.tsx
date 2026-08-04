import 'reflect-metadata';
import { notFound, redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { GetDocumentDetailsUseCase } from '~/modules/gestion-documental/application/get-document-details.use-case';
import { DocumentDetailsCard } from '~/components/document/document-details-card';
import { ClientDocumentLoader } from './_client-document-loader';
import { DocumentHistorySection } from '~/components/document/document-history-section';
import { getPaginatedDocumentHistory } from './_actions';
import { auth } from '~/modules/auth/lib/auth';
import { SystemShell } from '~/components/layout/SystemShell';
import type { PaginatedHistory } from '~/modules/gestion-documental/core/document-history.repository';

type DocumentDetailPageProps = {
    params: {
        documentId: string;
    };
};

const INITIAL_HISTORY_LIMIT = 10;

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
    const { documentId } = params;

    const session = await auth();
    if (!session?.user?.organizationId) {
        redirect('/login');
    }
    const user = session.user;
    const organizationId = user.organizationId;

    let documentDetails = null;
    let initialPaginatedHistory: PaginatedHistory = { history: [], hasMore: false };

    try {
        const getDocumentDetailsUseCase = container.resolve<GetDocumentDetailsUseCase>(
            InjectionTokens.GetDocumentDetailsUseCase
        );
        documentDetails = await getDocumentDetailsUseCase.execute({ documentId, organizationId });
    } catch {
        documentDetails = null;
    }

    try {
        initialPaginatedHistory = await getPaginatedDocumentHistory(documentId, INITIAL_HISTORY_LIMIT, 0);
    } catch {
        initialPaginatedHistory = { history: [], hasMore: false };
    }

    // Fallback for dynamically generated documents (stored in localStorage)
    if (!documentDetails && documentId.startsWith('doc-gen-')) {
        // We will handle this on the client side via a small component
        // For now, show a placeholder that will be replaced by client-side data
        documentDetails = {
            id: documentId,
            trackingId: 'CARGANDO...',
            trackingCode: 'CARGANDO...',
            subject: 'Cargando información del documento...',
            documentType: 'Documento',
            sender: '—',
            status: 'En Proceso',
            destinationAreaName: '—',
            receptionDate: new Date(),
            createdAt: new Date(),
            downloadUrl: null,
            organizationId: organizationId,
        } as any;
    }

    if (!documentDetails) {
        notFound();
    }

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={organizationId}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Detalle de Documento y Hoja de Ruta</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                        Información oficial del CITE, estado de recepción y trazabilidad de derivaciones.
                    </p>
                </div>

                {documentId.startsWith('doc-gen-') ? (
                    <ClientDocumentLoader documentId={documentId} organizationId={organizationId} />
                ) : (
                    <DocumentDetailsCard document={documentDetails} />
                )}
                <DocumentHistorySection
                    documentId={documentId}
                    initialPaginatedHistory={initialPaginatedHistory}
                />
            </div>
        </SystemShell>
    );
}