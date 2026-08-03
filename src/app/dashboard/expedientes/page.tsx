'use client';

import * as React from 'react';
import { ExpedientesDataTable, type Expediente } from '~/modules/expedientes/components/expedientes-data-table';
import { CrearExpedienteModal } from '~/modules/expedientes/components/crear-expediente-modal';

export default function ExpedientesPage() {
    const [data, setData] = React.useState<Expediente[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchExpedientes = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/expedientes');
            if (!res.ok) throw new Error('Error al cargar expedientes');
            const result = await res.json();
            setData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchExpedientes();
    }, [fetchExpedientes]);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Gestión de Expedientes</h1>
                <CrearExpedienteModal onCreated={fetchExpedientes} />
            </div>

            {loading && <p className="text-gray-500">Cargando expedientes...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && <ExpedientesDataTable data={data} />}
        </div>
    );
}
