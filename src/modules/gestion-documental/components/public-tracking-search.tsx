'use client';

import * as React from 'react';
import type { PublicTrackingResult } from '../application/get-public-tracking-info.use-case';

export function PublicTrackingSearch({ initialCode = '' }: { initialCode?: string }) {
    const [code, setCode] = React.useState(initialCode);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [result, setResult] = React.useState<PublicTrackingResult | null>(null);

    const handleSearch = React.useCallback(async (queryCode: string) => {
        if (!queryCode || queryCode.trim() === '') return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`/api/public/tracking/${encodeURIComponent(queryCode.trim())}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Trámite no encontrado.');
            }

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al consultar el trámite.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (initialCode) {
            handleSearch(initialCode);
        }
    }, [initialCode, handleSearch]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(code);
    };

    return (
        <div className="space-y-6">
            {/* Search Input Box */}
            <form onSubmit={onSubmit} className="flex gap-2 max-w-xl mx-auto">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ej. AEV/DG-TIC/INF/N°0001/2026"
                        className="w-full h-12 px-4 pl-11 text-sm bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono shadow-inner"
                    />
                    <svg className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-6 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Buscar'
                    )}
                </button>
            </form>

            {/* Error state */}
            {error && (
                <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-xs sm:text-sm text-center max-w-xl mx-auto space-y-1">
                    <p className="font-semibold">{error}</p>
                    <p className="text-[11px] text-rose-400">Asegúrese de haber ingresado la sigla e identificador completo de su recibo.</p>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                            <div>
                                <span className="text-xs font-semibold text-cyan-400 font-mono">{result.trackingCode}</span>
                                <h2 className="text-lg font-bold text-white mt-0.5">{result.subject}</h2>
                                <p className="text-xs text-slate-400 mt-1">Entidad: <strong className="text-slate-200">{result.organizationName || 'Institución Oficial'}</strong></p>
                            </div>
                            <div className="self-start sm:self-auto">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700">
                                    {result.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <span className="text-slate-400">Tipo de Documento</span>
                                <p className="text-sm font-semibold text-slate-200 mt-0.5">{result.documentType}</p>
                            </div>
                            <div>
                                <span className="text-slate-400">Ubicación / Área Actual</span>
                                <p className="text-sm font-semibold text-indigo-300 mt-0.5">{result.currentAreaName || 'Mesa de Partes'}</p>
                            </div>
                            <div>
                                <span className="text-slate-400">Fecha de Recepción</span>
                                <p className="text-sm font-semibold text-slate-200 mt-0.5">{new Date(result.receptionDate).toLocaleString('es-BO')}</p>
                            </div>
                        </div>

                        {result.applicantName && (
                            <div className="pt-2 border-t border-slate-800 text-xs flex flex-wrap gap-4 text-slate-400">
                                <div>Solicitante: <span className="text-slate-200 font-semibold">{result.applicantName}</span></div>
                                {result.applicantInstitution && <div>Institución: <span className="text-slate-200 font-semibold">{result.applicantInstitution}</span></div>}
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Historial de Recorrido e Itinerario
                        </h3>

                        {result.history.length === 0 ? (
                            <p className="text-xs text-slate-400">El documento fue recepcionado y se encuentra en su área inicial.</p>
                        ) : (
                            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 pl-8">
                                {result.history.map((event, idx) => (
                                    <div key={idx} className="relative space-y-1">
                                        <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-white">{event.action}</span>
                                            <span className="text-slate-500 text-[11px]">{new Date(event.timestamp).toLocaleString('es-BO')}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {event.fromAreaName ? `Origen: ${event.fromAreaName}` : ''} {event.toAreaName ? `→ Destino: ${event.toAreaName}` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
