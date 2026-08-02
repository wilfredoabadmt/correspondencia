import * as React from 'react';
import Link from 'next/link';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { RecentDocument } from '@/modules/dashboard/core/dashboard.repository';

type RecentDocumentsTableProps = {
    documents: RecentDocument[];
};

export function RecentDocumentsTable({ documents }: RecentDocumentsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Código de Trámite</TableHead>
                    <TableHead>Asunto</TableHead>
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
                        <TableCell className="text-right">
                            {new Date(doc.receptionDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            })}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}