import * as React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { CiteConfigModal } from '~/modules/gestion-documental/components/cite-config-modal';
import type { CiteConfig } from '~/modules/gestion-documental/core/cite-config.repository';

export const metadata: Metadata = {
    title: 'Gestor de CITEs Automáticos | GestorDoc',
    description: 'Administración de patrones de CITE y correlativos institucionales.',
};

async function getCiteConfigs(): Promise<CiteConfig[]> {
    try {
        const host = headers().get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const cookie = headers().get('cookie') || '';
        const res = await fetch(`${protocol}://${host}/api/admin/cites`, {
            headers: { cookie },
            cache: 'no-store',
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export default async function AdminCitesPage() {
    const configs = await getCiteConfigs();

    return (
        <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestor de CITEs Automáticos</h1>
                    <p className="text-sm text-muted-foreground">
                        Configure la nomenclatura correlativa institucional y las reglas de formateo dinámico por área y tipo documental.
                    </p>
                </div>
                <CiteConfigModal />
            </div>

            {/* Syntax Help Card */}
            <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Variables de Sintaxis Soportadas
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-indigo-800 dark:text-indigo-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div><code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border">{'{ENTIDAD}'}</code>: Sigla Organización</div>
                    <div><code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border">{'{AREA}'}</code>: Código de Área</div>
                    <div><code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border">{'{TIPO}'}</code>: Tipo de Documento</div>
                    <div><code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border">{'{NUMERO:4}'}</code>: Correlativo Rellenado</div>
                </CardContent>
            </Card>

            {/* Rules Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Reglas de CITE Configuradas</CardTitle>
                </CardHeader>
                <CardContent>
                    {configs.length === 0 ? (
                        <div className="text-center py-12 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">No hay reglas de CITE personalizadas.</p>
                            <p className="text-xs text-muted-foreground">El sistema usará el patrón por defecto: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{'{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO:4}/{AÑO}'}</code></p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                                    <tr>
                                        <th className="px-4 py-3">Patrón de CITE</th>
                                        <th className="px-4 py-3">Tipo Doc</th>
                                        <th className="px-4 py-3">Gestión</th>
                                        <th className="px-4 py-3 text-center">Secuencia Actual</th>
                                        <th className="px-4 py-3 text-center">Reseteo Anual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {configs.map((cfg) => (
                                        <tr key={cfg.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                                                {cfg.formatPattern}
                                            </td>
                                            <td className="px-4 py-3">{cfg.documentType || 'Todos'}</td>
                                            <td className="px-4 py-3">{cfg.year}</td>
                                            <td className="px-4 py-3 text-center font-bold">
                                                {cfg.currentSequence}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {cfg.resetYearly ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Sí
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
