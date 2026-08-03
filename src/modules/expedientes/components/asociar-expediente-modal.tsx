'use client';

import * as React from 'react';
import { Button } from '~/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';

type Expediente = {
    id: string;
    code: string;
    subject: string;
};

interface AsociarExpedienteModalProps {
    documentId: string;
    onAssociated?: () => void;
}

export function AsociarExpedienteModal({ documentId, onAssociated }: AsociarExpedienteModalProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Expediente[]>([]);
    const [selectedExpediente, setSelectedExpediente] = React.useState<Expediente | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/expedientes?query=${encodeURIComponent(searchTerm)}`);
            if (!res.ok) throw new Error('Error al buscar expedientes');
            const result = await res.json();
            setSearchResults(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssociate = async () => {
        if (!selectedExpediente) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/documents/${documentId}/associate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expedienteId: selectedExpediente.id }),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Error al asociar');
            }
            setOpen(false);
            setSelectedExpediente(null);
            setSearchTerm('');
            setSearchResults([]);
            onAssociated?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                    setSelectedExpediente(null);
                    setSearchTerm('');
                    setSearchResults([]);
                    setError(null);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">Asociar a Expediente</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asociar Documento a Expediente</DialogTitle>
                    <DialogDescription>
                        Busca un expediente existente para asociar este documento.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Buscar por código o asunto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? '...' : 'Buscar'}
                        </Button>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    {searchResults.length > 0 && (
                        <div className="border rounded-md max-h-48 overflow-y-auto">
                            {searchResults.map((exp) => (
                                <div
                                    key={exp.id}
                                    className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 ${
                                        selectedExpediente?.id === exp.id ? 'bg-gray-200' : ''
                                    }`}
                                    onClick={() => setSelectedExpediente(exp)}
                                >
                                    <div>
                                        <p className="font-medium">{exp.code}</p>
                                        <p className="text-sm text-gray-500">{exp.subject}</p>
                                    </div>
                                    {selectedExpediente?.id === exp.id && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleAssociate} disabled={!selectedExpediente || loading}>
                        {loading ? 'Asociando...' : 'Asociar Documento'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
