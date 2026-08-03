'use client';

import { useState } from 'react';
import { cancelDerivationAction } from '../_actions';
import { Button } from '~/components/ui/button';
import { StatusSemaphoreBadge } from '~/components/document/status-semaphore-badge';
import type { Document } from '~/modules/gestion-documental/core/document.repository';

interface SentInboxTableProps {
    documents: Document[];
}

export function SentInboxTable({ documents }: SentInboxTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleCancel = async (docId: string) => {
        if (!confirm('¿Estás seguro de cancelar esta derivación? El trámite retornará a tus pendientes.')) {
            return;
        }
        setLoadingId(docId);
        const res = await cancelDerivationAction({ documentId: docId });
        setLoadingId(null);
        if (!res.success) {
            alert(res.error);
        }
    };

    if (documents.length === 0) {
        return (
            <div className="bg-card p-12 text-center rounded-lg border text-muted-foreground">
                No se encontraron derivaciones enviadas recientemente.
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
                            <th className="py-3 px-4 font-semibold">Estado de Recepción</th>
                            <th className="py-3 px-4 font-semibold">Plazo / Días</th>
                            <th className="py-3 px-4 font-semibold">Fecha Envío</th>
                            <th className="py-3 px-4 font-semibold text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {documents.map((doc) => {
                            const isReceivingPending = doc.status === 'PENDIENTE_RECEPCION';
                            return (
                                <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="py-3 px-4 font-mono font-medium">{doc.trackingCode || doc.trackingId}</td>
                                    <td className="py-3 px-4 font-medium">{doc.subject}</td>
                                    <td className="py-3 px-4">
                                        {isReceivingPending ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                No Recibido (En Tránsito)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                Recepcionado
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <StatusSemaphoreBadge startDate={doc.createdAt} />
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('es-PE') : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {isReceivingPending ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950"
                                                disabled={loadingId === doc.id}
                                                onClick={() => handleCancel(doc.id)}
                                            >
                                                Cancelar Derivación
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">No cancelable</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
