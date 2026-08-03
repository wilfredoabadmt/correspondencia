'use client';

import { useState } from 'react';
import { unarchiveDocumentAction } from '../_actions';
import { Button } from '~/components/ui/button';
import type { Document } from '~/modules/gestion-documental/core/document.repository';

interface ArchivedInboxTableProps {
    documents: Document[];
}

export function ArchivedInboxTable({ documents }: ArchivedInboxTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleUnarchive = async (docId: string) => {
        setLoadingId(docId);
        const res = await unarchiveDocumentAction({ documentId: docId });
        setLoadingId(null);
        if (!res.success) {
            alert(res.error);
        }
    };

    if (documents.length === 0) {
        return (
            <div className="bg-card p-12 text-center rounded-lg border text-muted-foreground">
                No hay correspondencia archivada.
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="py-3 px-4 font-semibold">N° Hoja de Ruta</th>
                            <th className="py-3 px-4 font-semibold">Asunto</th>
                            <th className="py-3 px-4 font-semibold">Carpeta</th>
                            <th className="py-3 px-4 font-semibold">Observaciones</th>
                            <th className="py-3 px-4 font-semibold text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4 font-mono font-medium">{doc.trackingCode || doc.trackingId}</td>
                                <td className="py-3 px-4 font-medium">{doc.subject}</td>
                                <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                    {doc.folderCategory || 'GENERAL'}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">{doc.archiveObservations || '-'}</td>
                                <td className="py-3 px-4 text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={loadingId === doc.id}
                                        onClick={() => handleUnarchive(doc.id)}
                                    >
                                        Quitar de Archivo
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
