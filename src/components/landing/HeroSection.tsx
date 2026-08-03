'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface TrackItem {
    code: string;
    subject: string;
    currentArea: string;
    status: string;
    daysElapsed: number;
}

export function HeroSection() {
    const [searchCode, setSearchCode] = useState('');
    const [searchResult, setSearchResult] = useState<TrackItem | null>(null);

    const sampleCodes: TrackItem[] = [
        { code: 'E-2026-00558', subject: 'Reiteración de Pago de Inspección de Obra', currentArea: 'Dirección General Ejecutiva', status: 'En Proceso', daysElapsed: 2 },
        { code: 'I-2026-00684', subject: 'Solicitud de Elaboración de Informe de Estado SIPAGO', currentArea: 'Unidad de Tecnologías de Información', status: 'Recibido', daysElapsed: 1 },
        { code: 'N-2026-00120', subject: 'Nota Interna de Coordinación Interinstitucional', currentArea: 'Dirección Nacional de Planificación', status: 'Atendido', daysElapsed: 0 },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchCode.trim().toUpperCase();
        const match = sampleCodes.find(item => item.code.toUpperCase() === trimmed) || {
            code: trimmed || 'HR-2026-9941',
            subject: 'Documento Registrado en la Gestión Activa',
            currentArea: 'Ventanilla Única Nacional',
            status: 'Recibido',
            daysElapsed: 1,
        };
        setSearchResult(match);
    };

    return (
        <section className="relative pt-12 pb-24 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
            <div className="absolute top-1/3 right-10 w-[450px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-xs font-mono font-medium text-cyan-300 tracking-wide uppercase">
                            SIGEC • Plataforma Avanzada de Correspondencia
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                        Gestión Documental <br className="hidden sm:inline" />
                        <span className="text-gradient-cyan">Futurista, Ágil y Transparente</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
                        Control integral de Hojas de Ruta, derivaciones inmediatas, expedientes digitales y monitoreo gerencial de plazos con aislamiento estricto de roles.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-500/30 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-1 text-center"
                        >
                            Ingresar al Sistema por Roles
                        </Link>
                        <a
                            href="#roles"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all text-center"
                        >
                            Ver Roles & Capacidades
                        </a>
                    </div>
                </div>

                {/* Simulator Card: Fast Tracking Lookup */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 backdrop-blur-2xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Consulta de Trazabilidad Rápida</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mt-1">Verificación Inmediata de Hoja de Ruta</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-slate-400">Ejemplos rápidos:</span>
                                {sampleCodes.map(s => (
                                    <button
                                        key={s.code}
                                        onClick={() => {
                                            setSearchCode(s.code);
                                            setSearchResult(s);
                                        }}
                                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-blue-600/30 text-cyan-300 border border-slate-700 transition-all"
                                    >
                                        {s.code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Input Form */}
                        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    placeholder="Ingrese Código CITE o Hoja de Ruta (Ej: E-2026-00558)"
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white font-mono text-sm placeholder-slate-500 transition-all outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0"
                            >
                                <span>Consultar Estado</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>

                        {/* Search Result Visualizer */}
                        {searchResult && (
                            <div className="mt-6 p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 animate-fadeIn">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-cyan-400 text-lg">{searchResult.code}</span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {searchResult.status}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {searchResult.daysElapsed === 0 ? 'Sin retraso' : `${searchResult.daysElapsed} día(s) en bandeja`}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-200 mt-2">{searchResult.subject}</p>
                                        <p className="text-xs text-slate-400 mt-1">Ubicación actual: <span className="text-slate-200 font-semibold">{searchResult.currentArea}</span></p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            href="/login"
                                            className="text-xs font-semibold px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
                                        >
                                            <span>Atender en Sistema</span>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Key Metric Highlights */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-6 rounded-2xl text-center">
                        <div className="text-3xl font-extrabold text-white font-mono text-gradient-cyan">99.9%</div>
                        <div className="text-xs text-slate-400 font-medium mt-1">Disponibilidad en Nube</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl text-center">
                        <div className="text-3xl font-extrabold text-white font-mono text-gradient-emerald">100%</div>
                        <div className="text-xs text-slate-400 font-medium mt-1">Trazabilidad en Tiempo Real</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl text-center">
                        <div className="text-3xl font-extrabold text-white font-mono text-cyan-400">Zero-Delay</div>
                        <div className="text-xs text-slate-400 font-medium mt-1">Notificación de Plazos</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl text-center">
                        <div className="text-3xl font-extrabold text-white font-mono text-indigo-400">Multi-Tenant</div>
                        <div className="text-xs text-slate-400 font-medium mt-1">Aislamiento por Organización</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
