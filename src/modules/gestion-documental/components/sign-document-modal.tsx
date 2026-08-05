'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type SignDocumentModalProps = {
    documentId: string;
    trackingId?: string | null;
    subject?: string | null;
    onSigned?: () => void;
};

export function SignDocumentModal({ documentId, trackingId, subject, onSigned }: SignDocumentModalProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSign = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/documents/${documentId}/sign`, {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al firmar el documento.');
            }

            setIsOpen(false);
            if (onSigned) onSigned();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar la firma.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-9 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Firmar Digitalmente
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">Confirmar Firma Digital</h3>
                        <p className="text-sm text-muted-foreground">
                            Está a punto de firmar digitalmente el documento <strong>{trackingId || documentId}</strong>. Esta acción generará un sello hash SHA-256 inmutable y un código QR de verificación pública.
                        </p>

                        {subject && (
                            <div className="p-3 bg-muted rounded-md text-xs font-mono">
                                <strong>Asunto:</strong> {subject}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={handleSign}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? 'Firmando...' : 'Confirmar y Firmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
