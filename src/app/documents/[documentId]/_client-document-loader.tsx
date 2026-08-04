'use client';

import { useEffect, useState } from 'react';
import { DocumentDetailsCard } from '~/components/document/document-details-card';

interface Props {
    documentId: string;
    organizationId: string;
}

export function ClientDocumentLoader({ documentId, organizationId }: Props) {
    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(`generated-docs-${organizationId}`);
            if (saved) {
                const docs = JSON.parse(saved);
                const found = docs.find((d: any) => d.id === documentId);
                if (found) {
                    setDoc(found);
                }
            }
        } catch (e) {
            console.error('Error loading document from localStorage', e);
        }
        setLoading(false);
    }, [documentId, organizationId]);

    if (loading) {
        return <div className="text-center py-8 text-slate-400">Cargando documento...</div>;
    }

    if (!doc) {
        return (
            <div className="text-center py-8 text-rose-400">
                Documento no encontrado en el almacenamiento local.
            </div>
        );
    }

    return <DocumentDetailsCard document={doc} />;
}
