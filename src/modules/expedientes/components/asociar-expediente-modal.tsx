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
import { Label } from '~/components/ui/label';

// TODO: Definir el tipo de dato para un expediente (quizás importarlo de otro lugar)
type Expediente = {
    id: string;
    code: string;
    subject: string;
};

interface AsociarExpedienteModalProps {
    documentId: string;
}

export function AsociarExpedienteModal({ documentId }: AsociarExpedienteModalProps) {
    // TODO: Implementar lógica para buscar expedientes
    // TODO: Implementar react-hook-form y zod para validación si el modal tiene formulario
    // TODO: Implementar la llamada a la API para asociar el documento
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Expediente[]>([]);
    const [selectedExpediente, setSelectedExpediente] = React.useState<Expediente | null>(null);

    const handleSearch = () => {
        // Mock search results
        const mockExpedientes: Expediente[] = [
            { id: 'exp1', code: 'EXP-2023-001', subject: 'Expediente de Contrato X' },
            { id: 'exp2', code: 'EXP-2023-002', subject: 'Expediente de Licitación Y' },
            { id: 'exp3', code: 'EXP-2024-001', subject: 'Expediente de Proyecto Z' },
        ];
        setSearchResults(
            mockExpedientes.filter(
                (exp) =>
                    exp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    exp.subject.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    };

    const handleAssociate = () => {
        if (selectedExpediente) {
            console.log(`Documento ${documentId} asociado al expediente ${selectedExpediente.id}`);
            // TODO: Llamar a la API PUT /api/documents/[documentId]/associate
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Asociar a Expediente</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asociar Documento a Expediente</DialogTitle>
                    <DialogDescription>
                        Busca un expediente existente para asociar este documento ({documentId}).
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
                        <Button onClick={handleSearch}>Buscar</Button>
                    </div>

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
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-green-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleAssociate} disabled={!selectedExpediente}>
                        Asociar Documento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}