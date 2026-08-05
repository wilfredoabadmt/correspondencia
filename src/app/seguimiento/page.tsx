import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { PublicTrackingSearch } from '~/modules/gestion-documental/components/public-tracking-search';
import type { PublicTrackingResult } from '~/modules/gestion-documental/application/get-public-tracking-info.use-case';

export const metadata: Metadata = {
    title: 'Seguimiento Público de Trámites | GestorDoc',
    description: 'Portal público para consulta del estado en tiempo real de correspondencia institucional.',
};

export default function PublicTrackingPage({
    searchParams,
}: {
    searchParams?: { codigo?: string };
}) {
    const initialCode = searchParams?.codigo || '';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
            {/* Header / Navbar */}
            <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
                            GD
                        </div>
                        <span className="font-bold text-lg text-white tracking-wide">GestorDoc</span>
                        <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                            Portal Ciudadano
                        </span>
                    </div>

                    <Link
                        href="/login"
                        className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
                    >
                        Acceso Servidores Públicos →
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
                {/* Hero section */}
                <div className="text-center space-y-3 pt-4">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Consulta de Estado de Trámites
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                        Ingrese su código CITE o de seguimiento oficial para verificar la ubicación y avance en tiempo real de su correspondencia.
                    </p>
                </div>

                {/* Interactive Search Box */}
                <PublicTrackingSearch initialCode={initialCode} />
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} GestorDoc — Sistema de Gestión Documental y Correspondencia Institucional.
            </footer>
        </div>
    );
}
