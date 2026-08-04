import 'reflect-metadata';
import { notFound, redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { GetDocumentDetailsUseCase } from '~/modules/gestion-documental/application/get-document-details.use-case';
import { DocumentDetailsCard } from '~/components/document/document-details-card';
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

    // Fallback for sample demo documents or dynamically generated documents not yet in database
    if (!documentDetails && (documentId.includes('sample') || documentId.includes('doc-gen') || documentId.includes('tpl'))) {
        documentDetails = {
            id: documentId,
            trackingId: `E-2026-${documentId.slice(-5)}`,
            trackingCode: `AEV/DNP/INF/Nro.${documentId.slice(-4)}/2026`,
            subject: 'DOCUMENTO GENERADO — INFORME DE EVALUACIÓN TÉCNICA Y GESTIÓN SIGEC',
            documentType: 'Informe',
            sender: 'Juan José Espejo (Director General)',
            status: 'En Proceso',
            destinationAreaName: 'Unidad de Tecnologías de Información y Comunicación',
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

                <DocumentDetailsCard document={documentDetails} />
                <DocumentHistorySection
                    documentId={documentId}
                    initialPaginatedHistory={initialPaginatedHistory}
                />
            </div>
        </SystemShell>
    );
}