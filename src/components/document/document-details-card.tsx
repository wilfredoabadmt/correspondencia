import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { GetDocumentDetailsUseCaseResult } from '~/modules/gestion-documental/application/get-document-details.use-case';

type DocumentDetailsCardProps = {
    document: GetDocumentDetailsUseCaseResult;
};

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base">{value ?? 'N/A'}</p>
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DetailItem label="Código de Trámite" value={document.trackingId} />
                <DetailItem label="Estado" value={document.status} />
                <DetailItem label="Asunto" value={document.subject} />
                <DetailItem label="Tipo de Documento" value={document.documentType} />
                <DetailItem label="Remitente" value={document.sender} />
                <DetailItem label="Área de Destino" value={document.destinationAreaName} />
                <DetailItem label="Fecha de Recepción" value={formatDate(document.receptionDate)} />
                <DetailItem label="Fecha del Documento" value={formatDate((document as any).documentDate || document.receptionDate)} />
                <DetailItem label="Observaciones" value={(document as any).observations ?? 'N/A'} />
            </CardContent>
        </Card>
    );
}