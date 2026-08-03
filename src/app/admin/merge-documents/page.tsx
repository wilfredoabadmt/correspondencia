'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SystemShell } from '~/components/layout/SystemShell';
import {
    listMergeDocuments,
    mergeDocumentsAction,
    unmergeDocumentAction,
    type MergeDocumentItem,
} from './_actions';

export default function MergeDocumentsPage() {
    const [documents, setDocuments] = useState<MergeDocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [parentDocId, setParentDocId] = useState<string>('');
    const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await listMergeDocuments();
            setDocuments(data);
            if (data.length > 0 && !parentDocId) {
                setParentDocId(data[0].id);
            }
        } catch {
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleChildSelection = (id: string) => {
        setSelectedChildrenIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleMerge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parentDocId || selectedChildrenIds.length === 0) return;

        try {
            setSubmitting(true);
            setMessage(null);
            await mergeDocumentsAction(parentDocId, selectedChildrenIds);
            setMessage(`¡Trámites fusionados exitosamente bajo la Hoja de Ruta principal!`);
            setSelectedChildrenIds([]);
            await loadData();
        } catch (err: any) {
            setMessage(`Error al fusionar: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnmerge = async (id: string, code: string) => {
        if (!confirm(`¿Desea separar y desagregar el trámite ${code} de su Hoja de Ruta principal?`)) return;
        try {
            await unmergeDocumentAction(id);
            setMessage(`Trámite ${code} separado y desagregado.`);
            await loadData();
        } catch (err: any) {
            setMessage(`Error al separar: ${err.message}`);
        }
    };

    const parentDoc = documents.find(d => d.id === parentDocId);
    const standaloneDocs = documents.filter(d => !d.groupedIntoId && d.id !== parentDocId);
    const mergedDocs = documents.filter(d => d.groupedIntoId);

    return (
        <SystemShell userRole="SUPERADMIN" userName="Super Usuario de Sistema">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Fusión y Desagregación de Trámites</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    🔗 Módulo Super Usuario
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1">
                                Fusione múltiples Hojas de Ruta en un trámite principal o desagregue anexos de un expediente consolidado.
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Merge Form Panel */}
                    <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span>🔗 Fusionar / Agrupar Hojas de Ruta</span>
                            </h2>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-500/30">
                                Nueva Fusión
                            </span>
                        </div>

                        <form onSubmit={handleMerge} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                    1. Seleccionar Hoja de Ruta Principal (Trámite Padre):
                                </label>
                                <select
                                    value={parentDocId}
                                    onChange={(e) => {
                                        setParentDocId(e.target.value);
                                        setSelectedChildrenIds([]);
                                    }}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                >
                                    {documents.filter(d => !d.groupedIntoId).map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.trackingCode} - {doc.subject.substring(0, 50)}...
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {parentDoc && (
                                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                                    <div className="text-slate-400 text-[10px] font-mono">Detalle del Trámite Padre:</div>
                                    <div className="font-bold text-white">{parentDoc.subject}</div>
                                    <div className="text-cyan-400 font-mono text-[11px]">{parentDoc.sender}</div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                    2. Seleccionar Hojas de Ruta Anexas a Fusionar:
                                </label>
                                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
                                    {standaloneDocs.length === 0 ? (
                                        <p className="p-4 text-center text-xs text-slate-400">No hay otros trámites independientes disponibles para agrupar.</p>
                                    ) : (
                                        standaloneDocs.map(doc => {
                                            const isChecked = selectedChildrenIds.includes(doc.id);
                                            return (
                                                <label
                                                    key={doc.id}
                                                    onClick={() => toggleChildSelection(doc.id)}
                                                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                                                        isChecked
                                                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md'
                                                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                                                    />
                                                    <div>
                                                        <div className="font-mono font-bold text-cyan-400 text-[11px]">{doc.trackingCode}</div>
                                                        <div className="font-medium text-white text-xs leading-snug">{doc.subject}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.sender}</div>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || selectedChildrenIds.length === 0}
                                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
                            >
                                {submitting ? 'Fusionando Trámites...' : `🔗 Fusionar ${selectedChildrenIds.length} Trámites Seleccionados`}
                            </button>
                        </form>
                    </div>

                    {/* Merged Documents & Unmerge Section */}
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span>✂️ Trámites Fusionados y Desagregación</span>
                                </h2>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {mergedDocs.length} Anexos Vinculados
                                </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                A continuación se muestran los trámites anexos que han sido fusionados dentro de Hojas de Ruta principales. Puede desagregar un trámite en cualquier momento.
                            </p>

                            <div className="space-y-3 max-h-[420px] overflow-y-auto no-scrollbar">
                                {mergedDocs.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
                                        No hay trámites fusionados actualmente.
                                    </div>
                                ) : (
                                    mergedDocs.map(doc => {
                                        const p = documents.find(d => d.id === doc.groupedIntoId);
                                        return (
                                            <div key={doc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative group hover:border-slate-700 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono font-bold text-xs text-cyan-400">{doc.trackingCode}</span>
                                                    <button
                                                        onClick={() => handleUnmerge(doc.id, doc.trackingCode)}
                                                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors flex items-center gap-1"
                                                        title="Separar y desagregar del trámite principal"
                                                    >
                                                        <span>✂️ Separar</span>
                                                    </button>
                                                </div>

                                                <div className="text-xs font-bold text-white">{doc.subject}</div>
                                                
                                                {p && (
                                                    <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 flex items-center gap-1">
                                                        <span className="text-slate-300">Vinculado a:</span>
                                                        <span className="text-cyan-300 font-bold">{p.trackingCode}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SystemShell>
    );
}
