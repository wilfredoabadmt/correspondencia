import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import type { PublicVerificationDetails } from '~/modules/gestion-documental/application/verify-document.use-case';

export const metadata: Metadata = {
    title: 'Verificación Oficial de Documento Digital | GestorDoc',
    description: 'Portal de Verificación Pública de Autenticidad e Integridad de Documentos Firmados Digitalmente.',
};

async function getVerificationData(code: string): Promise<PublicVerificationDetails> {
    try {
        const host = headers().get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const res = await fetch(`${protocol}://${host}/api/public/verify/${code}`, {
            cache: 'no-store',
        });
        if (!res.ok) throw new Error('Error al consultar servidor');
        return await res.json();
    } catch {
        return {
            isValid: false,
            verificationCode: code,
            trackingCode: null,
            subject: null,
            documentType: null,
            signedByUserName: null,
            organizationName: null,
            destinationAreaName: null,
            signedAt: null,
            signatureHash: null,
        };
    }
}

export default async function PublicVerificationPage({ params }: { params: { code: string } }) {
    const data = await getVerificationData(params.code);

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                {/* Header Logo */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-lg">
                        GD
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                        GestorDoc — Portal de Verificación Pública
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Sistema Oficial de Correspondencia y Validación Digital
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Status Banner */}
                    {data.isValid ? (
                        <div className="bg-emerald-600 text-white p-6 text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-1">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold">DOCUMENTO AUTÉNTICO Y VALIDADOS</h2>
                            <p className="text-xs text-emerald-100 max-w-md mx-auto">
                                La firma digital y la integridad del documento corresponden a los registros oficiales del sistema.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-rose-600 text-white p-6 text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-1">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold">CÓDIGO DE VERIFICACIÓN INVÁLIDO</h2>
                            <p className="text-xs text-rose-100 max-w-md mx-auto">
                                El código ingresado no existe en nuestros registros o el documento no cuenta con firma digital registrada.
                            </p>
                        </div>
                    )}

                    {/* Verification Details */}
                    <div className="p-6 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Código de Verificación
                                </span>
                                <p className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                    {data.verificationCode}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Nomenclatura / CITE
                                </span>
                                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-1">
                                    {data.trackingCode || 'N/A'}
                                </p>
                            </div>

                            <div className="sm:col-span-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Asunto
                                </span>
                                <p className="text-sm text-slate-800 dark:text-slate-200 mt-1 font-medium leading-relaxed">
                                    {data.subject || 'Sin Asunto'}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Firmado Por
                                </span>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                                    {data.signedByUserName || 'Servidor Público Autorizado'}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Organización / Entidad
                                </span>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                                    {data.organizationName || 'Entidad Pública'}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Fecha y Hora de Firma
                                </span>
                                <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                                    {formatDate(data.signedAt)}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Tipo de Documento
                                </span>
                                <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                                    {data.documentType || 'Trámite Interno'}
                                </p>
                            </div>

                            {data.signatureHash && (
                                <div className="sm:col-span-2 bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Hash de Firma Digital (SHA-256)
                                    </span>
                                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                                        {data.signatureHash}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href="/"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        ← Volver al Sistema de Correspondencia
                    </Link>
                </div>
            </div>

            <footer className="text-center text-xs text-slate-400 mt-8">
                GestorDoc © {new Date().getFullYear()} — Plataforma de Gestión Documental y Firma Digital
            </footer>
        </div>
    );
}
