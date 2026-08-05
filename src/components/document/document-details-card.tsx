import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { GetDocumentDetailsUseCaseResult } from '~/modules/gestion-documental/application/get-document-details.use-case';
import { DigitalSignatureBadge } from '~/modules/gestion-documental/components/digital-signature-badge';
import { SignDocumentModal } from '~/modules/gestion-documental/components/sign-document-modal';

type DocumentDetailsCardProps = {
    document: GetDocumentDetailsUseCaseResult;
};

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base">{value ?? 'N/A'}</div>
        </div>
    );
}

export function DocumentDetailsCard({ document }: DocumentDetailsCardProps) {
    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const doc = document as any;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Información General</CardTitle>
                <DigitalSignatureBadge
                    isSigned={doc.isSigned}
                    verificationCode={doc.verificationCode}
                    signedAt={doc.signedAt}
                />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DetailItem label="Código de Trámite" value={document.trackingId} />
                <DetailItem label="Estado" value={document.status} />
                <DetailItem label="Asunto" value={document.subject} />
                <DetailItem label="Tipo de Documento" value={document.documentType} />
                <DetailItem label="Remitente" value={document.sender} />
                <DetailItem label="Área de Destino" value={document.destinationAreaName} />
                <DetailItem label="Fecha de Recepción" value={formatDate(document.receptionDate)} />
                <DetailItem label="Fecha del Documento" value={formatDate(doc.documentDate || document.receptionDate)} />
                <DetailItem label="Observaciones" value={doc.observations ?? 'N/A'} />
            </CardContent>
            <div className="p-6 pt-0 flex flex-wrap items-center gap-3">
                {!doc.isSigned && (
                    <SignDocumentModal
                        documentId={document.id}
                        trackingId={document.trackingId}
                        subject={document.subject}
                    />
                )}
                <a href={`/api/documents/${document.id}/routing-slip`} target="_blank" rel="noreferrer">
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-9 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        Imprimir Hoja de Ruta (PDF)
                    </button>
                </a>
                <a href={`/api/documents/${document.id}/template`} download={`Plantilla_${doc.trackingCode ? doc.trackingCode.replace(/\//g, '_') : document.id}.docx`}>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-9 px-4 py-2 border border-slate-300 dark:border-slate-700 bg-background hover:bg-muted">
                        Descargar Plantilla (.docx)
                    </button>
                </a>
            </div>
        </Card>
    );
}