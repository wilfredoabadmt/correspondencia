'use client';

import { useState } from 'react';
import { receiveDocumentAction, rejectDocumentAction } from '../_actions';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { StatusSemaphoreBadge } from '~/components/document/status-semaphore-badge';
import type { Document } from '~/modules/gestion-documental/core/document.repository';

interface IncomingInboxTableProps {
    documents: Document[];
}

export function IncomingInboxTable({ documents }: IncomingInboxTableProps) {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleReceive = async (docId: string) => {
        setLoadingId(docId);
        const res = await receiveDocumentAction({ documentId: docId });
        setLoadingId(null);
        if (!res.success) {
            alert(res.error);
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedDocId || !rejectReason.trim()) return;
        setLoadingId(selectedDocId);
        const res = await rejectDocumentAction({ documentId: selectedDocId, reason: rejectReason });
        setLoadingId(null);
        setIsRejectOpen(false);
        setRejectReason('');
        if (!res.success) {
            alert(res.error);
        }
    };

    if (documents.length === 0) {
        return (
            <div className="bg-card p-12 text-center rounded-lg border text-muted-foreground">
                No tienes correspondencia entrante pendiente de recepción.
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
                            <th className="py-3 px-4 font-semibold">Remitente</th>
                            <th className="py-3 px-4 font-semibold">Plazo / Días</th>
                            <th className="py-3 px-4 font-semibold">Fecha Envío</th>
                            <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4 font-mono font-medium">{doc.trackingCode || doc.trackingId}</td>
                                <td className="py-3 px-4 font-medium">{doc.subject}</td>
                                <td className="py-3 px-4">{doc.sender}</td>
                                <td className="py-3 px-4">
                                    <StatusSemaphoreBadge startDate={doc.createdAt} />
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">
                                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('es-PE') : '-'}
                                </td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={loadingId === doc.id}
                                        onClick={() => handleReceive(doc.id)}
                                    >
                                        Recibir
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={loadingId === doc.id}
                                        onClick={() => {
                                            setSelectedDocId(doc.id);
                                            setIsRejectOpen(true);
                                        }}
                                    >
                                        Rechazar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar Hoja de Ruta</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Ingrese la justificación del rechazo (ej. no llegó en físico o fue enviado por error):
                        </p>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Motivo del rechazo..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleRejectSubmit} disabled={!rejectReason.trim()}>
                            Confirmar Rechazo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
