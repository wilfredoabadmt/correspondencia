import Link from 'next/link';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import type { Document } from '~/modules/gestion-documental/core/document.repository';

type DocumentsDataTableProps = {
    documents: Document[];
};

export function DocumentsDataTable({ documents }: DocumentsDataTableProps) {
    if (documents.length === 0) {
        return (
            <div className="rounded-md border flex items-center justify-center h-96">
                <p className="text-muted-foreground">No se encontraron documentos.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código de Trámite</TableHead>
                        <TableHead>Asunto</TableHead>
                        <TableHead>Remitente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Fecha de Recepción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((doc) => (
                        <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                                <Link href={`/documents/${doc.id}`} className="text-primary hover:underline">
                                    {doc.trackingId}
                                </Link>
                            </TableCell>
                            <TableCell>{doc.subject}</TableCell>
                            <TableCell>{doc.sender}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{doc.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {doc.receptionDate ? new Date(doc.receptionDate).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                }) : 'N/A'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}