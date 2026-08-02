import 'reflect-metadata';
import { notFound, redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { GetDocumentDetailsUseCase } from '~/modules/gestion-documental/application/get-document-details.use-case';
import { DocumentDetailsCard } from '~/components/document/document-details-card';
import { DocumentHistorySection } from '~/components/document/document-history-section';
import { getPaginatedDocumentHistory } from './_actions';
import { auth } from '~/modules/auth/lib/auth';

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
    const organizationId = session.user.organizationId;

    const getDocumentDetailsUseCase = container.resolve<GetDocumentDetailsUseCase>(InjectionTokens.GetDocumentDetailsUseCase);

    const [documentDetails, initialPaginatedHistory] = await Promise.all([
        getDocumentDetailsUseCase.execute({ documentId, organizationId }),
        getPaginatedDocumentHistory(documentId, INITIAL_HISTORY_LIMIT, 0),
    ]);

    if (!documentDetails) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Detalle del Documento</h1>
            <DocumentDetailsCard document={documentDetails} />
            <DocumentHistorySection
                documentId={documentId}
                initialPaginatedHistory={initialPaginatedHistory}
            />
        </div>
    );
}