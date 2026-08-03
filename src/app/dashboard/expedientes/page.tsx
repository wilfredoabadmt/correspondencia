'use client';

import * as React from 'react';
import { ExpedientesDataTable } from '~/modules/expedientes/components/expedientes-data-table';
import { CrearExpedienteModal } from '~/modules/expedientes/components/crear-expediente-modal';

// TODO: Estos datos serán cargados desde la API.
const MOCK_DATA = [];

export default function ExpedientesPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Gestión de Expedientes</h1>
                <CrearExpedienteModal />
            </div>
            <p className="mb-6">Aquí se mostrará el listado de expedientes.</p>
            
            <ExpedientesDataTable data={MOCK_DATA} />
        </div>
    );
}
