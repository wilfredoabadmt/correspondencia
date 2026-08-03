'use client';

import React from 'react';
import Link from 'next/link';

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                        <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                            <svg className="w-6 h-6 text-cyan-400 transform group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold tracking-wider text-white">Gestor<span className="text-gradient-cyan">Doc</span></span>
                            <span className="text-[10px] uppercase tracking-widest font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                                SIGEC v2.4
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Plataforma de Gestión de Correspondencia</span>
                    </div>
                </Link>

                {/* Nav items */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <a href="#funcionalidades" className="hover:text-cyan-400 transition-colors">
                        Funcionalidades
                    </a>
                    <a href="#bandejas" className="hover:text-cyan-400 transition-colors">
                        Bandejas & Flujos
                    </a>
                    <a href="#roles" className="hover:text-cyan-400 transition-colors">
                        Roles & Permisos
                    </a>
                    <a href="#trazabilidad" className="hover:text-cyan-400 transition-colors">
                        Seguimiento QR
                    </a>
                </nav>

                {/* Actions & Status */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Servidor Operativo</span>
                    </div>

                    <Link
                        href="/login"
                        className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <span>Iniciar Sesión</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
}
