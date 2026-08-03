'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

export default function ExpedienteDetailPage() {
    const params = useParams();
    const { id } = params;

    // TODO: Cargar datos reales del expediente desde la API
    const mockExpediente = {
        id: id as string,
        code: `EXP-${id?.substring(0, 4)}`,
        subject: `Expediente de prueba ${id}`,
        status: 'Abierto',
        organizationId: 'org1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: [
            { id: 'doc1', subject: 'Documento 1 asociado', trackingCode: 'DOC-001' },
            { id: 'doc2', subject: 'Documento 2 asociado', trackingCode: 'DOC-002' },
        ],
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Detalle del Expediente: {mockExpediente.code}</h1>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Asunto</p>
                        <p className="text-lg font-semibold">{mockExpediente.subject}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Estado</p>
                        <p className="text-lg font-semibold">{mockExpediente.status}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">ID</p>
                        <p className="text-sm">{mockExpediente.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                        <p className="text-sm">{new Date(mockExpediente.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Documentos Asociados</h2>
            {mockExpediente.documents.length > 0 ? (
                <ul className="list-disc pl-5">
                    {mockExpediente.documents.map((doc) => (
                        <li key={doc.id} className="mb-2">
                            <a href={`/documents/${doc.id}`} className="text-blue-600 hover:underline">
                                {doc.trackingCode} - {doc.subject}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay documentos asociados a este expediente.</p>
            )}
        </div>
    );
}
