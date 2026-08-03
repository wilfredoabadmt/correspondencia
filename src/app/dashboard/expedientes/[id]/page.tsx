'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type ExpedienteDetail = {
    id: string;
    code: string;
    subject: string;
    status: string;
    createdAt: string;
    documents: {
        id: string;
        subject: string | null;
        trackingCode: string | null;
        status: string | null;
        createdAt: string | null;
    }[];
};

export default function ExpedienteDetailPage() {
    const params = useParams();
    const { id } = params;
    const [data, setData] = React.useState<ExpedienteDetail | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!id) return;
        fetch(`/api/expedientes/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Expediente no encontrado');
                return res.json();
            })
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="container mx-auto py-10"><p>Cargando...</p></div>;
    if (error) return <div className="container mx-auto py-10"><p className="text-red-500">Error: {error}</p></div>;
    if (!data) return null;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Detalle del Expediente: {data.code}</h1>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Asunto</p>
                        <p className="text-lg font-semibold">{data.subject}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Estado</p>
                        <p className="text-lg font-semibold">{data.status}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">ID</p>
                        <p className="text-sm">{data.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                        <p className="text-sm">{new Date(data.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Documentos Asociados</h2>
            {data.documents.length > 0 ? (
                <ul className="list-disc pl-5">
                    {data.documents.map((doc) => (
                        <li key={doc.id} className="mb-2">
                            <Link href={`/documents/${doc.id}`} className="text-blue-600 hover:underline">
                                {doc.trackingCode} - {doc.subject}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay documentos asociados a este expediente.</p>
            )}
        </div>
    );
}
