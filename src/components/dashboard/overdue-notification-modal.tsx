'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { StatusSemaphoreBadge } from '~/components/document/status-semaphore-badge';
import type { Document } from '~/modules/gestion-documental/core/document.repository';

interface OverdueNotificationModalProps {
    overdueDocuments: Document[];
}

export function OverdueNotificationModal({ overdueDocuments }: OverdueNotificationModalProps) {
    const [isOpen, setIsOpen] = useState(overdueDocuments.length > 0);

    if (overdueDocuments.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2 text-lg font-bold">
                        ⚠️ Alerta: Trámites con Morosidad (&gt; 5 Días)
                    </DialogTitle>
                </DialogHeader>
                <div className="py-2 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Tienes <strong>{overdueDocuments.length}</strong> trámite(s) bajo tu custodia que superan los 5 días de antigüedad sin atención. Por favor, atienda o derive estos documentos a la brevedad:
                    </p>
                    <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                        {overdueDocuments.map((doc) => (
                            <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="space-y-1">
                                    <p className="font-mono font-bold text-sm">{doc.trackingCode || doc.trackingId}</p>
                                    <p className="text-xs font-medium line-clamp-1">{doc.subject}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusSemaphoreBadge startDate={doc.receptionDate || doc.createdAt} />
                                    <Link href={`/documents/${doc.id}`}>
                                        <Button size="sm" variant="outline">Ver Detalle</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsOpen(false)}>
                        Entendido / Cerrar
                    </Button>
                    <Link href="/inbox/pending">
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                            Ir a Bandeja de Pendientes
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
