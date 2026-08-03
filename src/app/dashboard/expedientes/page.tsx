'use client';

import * as React from 'react';
import { ExpedientesDataTable, type Expediente } from '~/modules/expedientes/components/expedientes-data-table';
import { CrearExpedienteModal } from '~/modules/expedientes/components/crear-expediente-modal';
import { SystemShell } from '~/components/layout/SystemShell';

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
            setData(result.data || []);
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
        <SystemShell>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Gestión de Expedientes Virtuales</h1>
                        <p className="text-slate-300 text-xs sm:text-sm mt-1">
                            Agrupación de Hojas de Ruta y notas internas en expedientes consolidados (Feature 017).
                        </p>
                    </div>

                    <CrearExpedienteModal onCreated={fetchExpedientes} />
                </div>

                {loading && <p className="text-slate-400 text-xs font-mono">Cargando expedientes...</p>}
                {error && <p className="text-rose-400 text-xs font-semibold">Error: {error}</p>}
                {!loading && !error && <ExpedientesDataTable data={data} />}
            </div>
        </SystemShell>
    );
}
