'use client';

import { useState } from 'react';
import Link from 'next/link';
import { justifyDelayAction, archiveDocumentAction } from '../_actions';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { Document } from '~/modules/gestion-documental/core/document.repository';

interface PendingInboxTableProps {
    documents: Document[];
}

export function PendingInboxTable({ documents }: PendingInboxTableProps) {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [justifyReason, setJustifyReason] = useState('');
    const [isJustifyOpen, setIsJustifyOpen] = useState(false);

    const [folderCategory, setFolderCategory] = useState('GESTION-2026');
    const [archiveObs, setArchiveObs] = useState('');
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);

    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleJustifySubmit = async () => {
        if (!selectedDocId || !justifyReason.trim()) return;
        setLoadingId(selectedDocId);
        const res = await justifyDelayAction({ documentId: selectedDocId, reason: justifyReason });
        setLoadingId(null);
        setIsJustifyOpen(false);
        setJustifyReason('');
        if (!res.success) {
            alert(res.error);
        } else {
            alert('Justificación guardada correctamente.');
        }
    };

    const handleArchiveSubmit = async () => {
        if (!selectedDocId || !folderCategory.trim()) return;
        setLoadingId(selectedDocId);
        const res = await archiveDocumentAction({
            documentId: selectedDocId,
            folderCategory,
            observations: archiveObs,
        });
        setLoadingId(null);
        setIsArchiveOpen(false);
        setArchiveObs('');
        if (!res.success) {
            alert(res.error);
        }
    };

    if (documents.length === 0) {
        return (
            <div className="bg-card p-12 text-center rounded-lg border text-muted-foreground">
                No tienes correspondencia pendiente en tu bandeja.
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
                            <th className="py-3 px-4 font-semibold">Tipo</th>
                            <th className="py-3 px-4 font-semibold">Fecha Recepción</th>
                            <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4 font-mono font-medium">{doc.trackingCode || doc.trackingId}</td>
                                <td className="py-3 px-4 font-medium">{doc.subject}</td>
                                <td className="py-3 px-4">{doc.documentType}</td>
                                <td className="py-3 px-4 text-muted-foreground">
                                    {doc.receptionDate ? new Date(doc.receptionDate).toLocaleDateString('es-PE') : '-'}
                                </td>
                                <td className="py-3 px-4 text-right space-x-1">
                                    <Link href={`/documents/${doc.id}`}>
                                        <Button size="sm" variant="outline">Derivar</Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={loadingId === doc.id}
                                        onClick={() => {
                                            setSelectedDocId(doc.id);
                                            setIsJustifyOpen(true);
                                        }}
                                    >
                                        Justificar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                        disabled={loadingId === doc.id}
                                        onClick={() => {
                                            setSelectedDocId(doc.id);
                                            setIsArchiveOpen(true);
                                        }}
                                    >
                                        Archivar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Justificar */}
            <Dialog open={isJustifyOpen} onOpenChange={setIsJustifyOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Justificar Trámite Pendiente</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <Label>Motivo / Explicación del Retardo:</Label>
                        <Textarea
                            value={justifyReason}
                            onChange={(e) => setJustifyReason(e.target.value)}
                            placeholder="Ej. En espera de informe técnico de inspección..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsJustifyOpen(false)}>Cancelar</Button>
                        <Button onClick={handleJustifySubmit} disabled={!justifyReason.trim()}>
                            Guardar Justificación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Archivar */}
            <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archivar Hoja de Ruta</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label>Carpeta / Gestión de Destino:</Label>
                            <Input
                                value={folderCategory}
                                onChange={(e) => setFolderCategory(e.target.value)}
                                placeholder="ej. GESTION-2026, CONTRATOS, etc."
                            />
                        </div>
                        <div>
                            <Label>Observaciones de Archivo (opcional):</Label>
                            <Textarea
                                value={archiveObs}
                                onChange={(e) => setArchiveObs(e.target.value)}
                                placeholder="Observación final del trámite..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsArchiveOpen(false)}>Cancelar</Button>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleArchiveSubmit} disabled={!folderCategory.trim()}>
                            Confirmar Archivado
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
