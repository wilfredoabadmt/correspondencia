'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SystemShell } from '~/components/layout/SystemShell';
import {
    getRoutingSlipConfig,
    saveRoutingSlipConfig,
    type RoutingSlipConfig,
} from './_actions';

export default function RoutingSlipConfigPage() {
    const [config, setConfig] = useState<RoutingSlipConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const [institutionName, setInstitutionName] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [citeInf, setCiteInf] = useState('');
    const [citeNot, setCiteNot] = useState('');
    const [citeCar, setCiteCar] = useState('');
    const [citeMem, setCiteMem] = useState('');
    const [citeCir, setCiteCir] = useState('');
    const [citeIns, setCiteIns] = useState('');
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getRoutingSlipConfig();
            setConfig(data);
            setInstitutionName(data.institutionName);
            setSubTitle(data.subTitle);
            setCiteInf(data.citeFormats.INF);
            setCiteNot(data.citeFormats.NOT);
            setCiteCar(data.citeFormats.CAR);
            setCiteMem(data.citeFormats.MEM);
            setCiteCir(data.citeFormats.CIR);
            setCiteIns(data.citeFormats.INS);
        } catch {
            setConfig(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setMessage(null);

            const formData = new FormData();
            formData.append('institutionName', institutionName);
            formData.append('subTitle', subTitle);
            formData.append('citeInf', citeInf);
            formData.append('citeNot', citeNot);
            formData.append('citeCar', citeCar);
            formData.append('citeMem', citeMem);
            formData.append('citeCir', citeCir);
            formData.append('citeIns', citeIns);
            if (selectedLogo) {
                formData.append('logoFile', selectedLogo);
            }

            const res = await saveRoutingSlipConfig(formData);
            if (res.success && res.config) {
                setConfig(res.config);
                setMessage('¡Configuración institucional de Hoja de Ruta guardada con éxito!');
            } else {
                setMessage(`Error al guardar: ${res.error || 'Ocurrió un error inesperado'}`);
            }
        } catch (err: any) {
            setMessage(`Error al guardar: ${err.message || 'Error de conexión'}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SystemShell userRole="SUPERADMIN" userName="Super Usuario de Sistema">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Navbar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Configuración de Hoja de Ruta Oficial PDF</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    🎨 Módulo Super Usuario
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1">
                                Personalice el nombre de la institución, subtítulo, carga de logo y las máscaras de CITE para los distintos tipos de documentos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alert message */}
                {message && (
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center justify-between gap-3 font-mono">
                        <span>{message}</span>
                        <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-mono text-xs">Cargando configuración institucional...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form Panel */}
                        <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span>⚙️ Parámetros de la Entidad y CITEs</span>
                                </h2>
                            </div>

                            <form onSubmit={handleSave} className="space-y-5">
                                {/* Institution Name */}
                                <div>
                                    <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Nombre Oficial de la Institución</label>
                                    <input
                                        type="text"
                                        required
                                        value={institutionName}
                                        onChange={(e) => setInstitutionName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Ministerio / Cabeza de Sector (Subtítulo)</label>
                                    <input
                                        type="text"
                                        value={subTitle}
                                        onChange={(e) => setSubTitle(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Logo Institucional (PDF Encabezado)</label>
                                    <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-3 text-center bg-slate-950/60 cursor-pointer transition-colors">
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg"
                                            onChange={(e) => setSelectedLogo(e.target.files?.[0] || null)}
                                            className="w-full text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Recomendado: PNG con fondo transparente (max 2MB)</p>
                                    </div>
                                </div>

                                {/* CITE Formats per Document Type */}
                                <div className="space-y-3 pt-2">
                                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                                        Formatos de Nomenclatura CITE por Tipo de Documento:
                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                                        <div>
                                            <span className="text-[10px] font-mono text-slate-300">📄 Informe (INF)</span>
                                            <input
                                                type="text"
                                                value={citeInf}
                                                onChange={(e) => setCiteInf(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono mt-1"
                                            />
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-mono text-slate-300">📝 Nota Interna (NOT)</span>
                                            <input
                                                type="text"
                                                value={citeNot}
                                                onChange={(e) => setCiteNot(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono mt-1"
                                            />
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-mono text-slate-300">✉️ Carta Oficial (CAR)</span>
                                            <input
                                                type="text"
                                                value={citeCar}
                                                onChange={(e) => setCiteCar(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono mt-1"
                                            />
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-mono text-slate-300">📋 Memorándum (MEM)</span>
                                            <input
                                                type="text"
                                                value={citeMem}
                                                onChange={(e) => setCiteMem(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono mt-1"
                                            />
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-mono text-slate-300">📢 Circular (CIR)</span>
                                            <input
                                                type="text"
                                                value={citeCir}
                                                onChange={(e) => setCiteCir(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono mt-1"
                                            />
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-mono text-slate-300">📌 Instructivo (INS)</span>
                                            <input
                                                type="text"
                                                value={citeIns}
                                                onChange={(e) => setCiteIns(e.target.value)}
                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono mt-1"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono">Utilice <code className="text-cyan-400 font-bold">{'{SEQ}'}</code> para la secuencia numérica y <code className="text-cyan-400 font-bold">{'{YEAR}'}</code> para el año.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 transition-all"
                                >
                                    {submitting ? 'Guardando Configuración...' : '💾 GUARDAR CONFIGURACIÓN INSTITUCIONAL'}
                                </button>
                            </form>
                        </div>

                        {/* Interactive PDF Preview */}
                        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span>🖨️ Previsualización de Encabezado PDF</span>
                                    </h2>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                        Hoja de Ruta Oficial
                                    </span>
                                </div>

                                {/* Simulated PDF Header Card */}
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 space-y-4 text-slate-900 bg-white">
                                    <div className="flex items-start justify-between border-b pb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center text-white text-xs font-bold font-mono">
                                            LOGO
                                        </div>

                                        <div className="text-center">
                                            <div className="text-xs font-extrabold tracking-wider text-slate-900">{institutionName}</div>
                                            <div className="text-[10px] text-slate-600 font-semibold">{subTitle}</div>
                                            <div className="text-xs font-extrabold text-blue-900 uppercase mt-1">HOJA DE RUTA OFICIAL DE SEGUIMIENTO</div>
                                        </div>

                                        <div className="text-right font-mono text-[11px]">
                                            <div className="text-xs font-bold text-rose-700">N° E-2026-00558</div>
                                            <div className="text-slate-500 text-[9px]">{new Date().toLocaleDateString('es-PE')}</div>
                                        </div>
                                    </div>

                                    <div className="text-[11px] font-mono space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="text-slate-600">Ejemplo de CITE generado para Informe (INF):</div>
                                        <div className="font-bold text-blue-900">{citeInf.replace('{SEQ}', '0028').replace('{YEAR}', '2026')}</div>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="/api/documents/doc-sample-1/routing-slip"
                                target="_blank"
                                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center transition-all flex items-center justify-center gap-2"
                            >
                                <span>📄 Probar Generación de PDF Real</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </SystemShell>
    );
}
