'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '~/components/ui/button';

export function ReportFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState(searchParams.get('status') || '');

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        router.push(`/reports?${params.toString()}`);
    };

    const excelUrl = `/api/reports/excel${status ? `?status=${status}` : ''}`;
    const pdfUrl = `/api/reports/pdf${status ? `?status=${status}` : ''}`;

    return (
        <div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold">Estado:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-9 px-3 text-sm rounded-md border bg-background"
                    >
                        <option value="">Todos los Estados</option>
                        <option value="Recibido">Recibido (Pendiente)</option>
                        <option value="PENDIENTE_RECEPCION">En Tránsito</option>
                        <option value="Archivado">Archivado</option>
                    </select>
                </div>

                <Button size="sm" onClick={handleFilter}>
                    Filtrar / Consultar
                </Button>

                <div className="ml-auto flex items-center gap-2">
                    <a href={excelUrl} download>
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
                            Exportar Excel (.xlsx)
                        </Button>
                    </a>
                    <a href={pdfUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20">
                            Exportar PDF
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
