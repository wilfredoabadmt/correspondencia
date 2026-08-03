import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 bg-futuristic-grid flex flex-col justify-between relative overflow-hidden py-10 px-4">
            {/* Glow Orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Back Button */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Volver a la Página Principal</span>
                </Link>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>SIGEC Portal Live</span>
                </div>
            </div>

            {/* Form Container */}
            <div className="my-8 relative z-10">
                <LoginForm />
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 font-mono relative z-10">
                GestorDoc SIGEC • Sistema de Gestión de Correspondencia e Inteligencia Documental
            </div>
        </div>
    );
}
