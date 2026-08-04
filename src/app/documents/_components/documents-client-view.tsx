'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createGeneratedDocument } from '../actions';

interface DocumentItem {
    id: string;
    trackingId?: string | null;
    trackingCode?: string | null;
    subject?: string | null;
    documentType?: string | null;
    sender?: string | null;
    status?: string | null;
    receptionDate?: Date | string | null;
    createdAt?: Date | string | null;
}

interface DocumentsClientViewProps {
    initialDocuments: DocumentItem[];
    organizationId: string;
}

export function DocumentsClientView({ initialDocuments, organizationId }: DocumentsClientViewProps) {
    // Load from localStorage first (temporary persistence)
    const getInitialDocuments = () => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(`generated-docs-${organizationId}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                }
            } catch (e) {}
        }
        return initialDocuments.length > 0 ? initialDocuments : [
            {
                id: 'doc-sample-1',
                trackingId: 'DOC-ORGA-001',
                trackingCode: 'AEV/DNP/INF/Nro.0028/2026',
                subject: 'INFORME DE EVALUACIÓN TÉCNICA DE PROYECTO DE VIVIENDA',
                documentType: 'Informe',
                sender: 'Juan José Espejo (Director General)',
                status: 'En Proceso',
                receptionDate: new Date().toISOString(),
            },
            {
                id: 'doc-sample-2',
                trackingId: 'DOC-ORGA-002',
                trackingCode: 'AEV/DNP/NOT/Nro.0011/2026',
                subject: 'ESTADO DEL SISTEMA DE GESTIÓN DE CORRESPONDENCIA SIGEC',
                documentType: 'Nota Interna',
                sender: 'Edwin Yujra (Jefe de Unidad TIC)',
                status: 'Recibido',
                receptionDate: new Date(Date.now() - 86400000).toISOString(),
            },
        ];
    };

    const [documents, setDocuments] = useState<DocumentItem[]>(getInitialDocuments());
        initialDocuments.length > 0
            ? initialDocuments
            : [
                {
                    id: 'doc-sample-1',
                    trackingId: 'DOC-ORGA-001',
                    trackingCode: 'AEV/DNP/INF/Nro.0028/2026',
                    subject: 'INFORME DE EVALUACIÓN TÉCNICA DE PROYECTO DE VIVIENDA',
                    documentType: 'Informe',
                    sender: 'Juan José Espejo (Director General)',
                    status: 'En Proceso',
                    receptionDate: new Date().toISOString(),
                },
                {
                    id: 'doc-sample-2',
                    trackingId: 'DOC-ORGA-002',
                    trackingCode: 'AEV/DNP/NOT/Nro.0011/2026',
                    subject: 'ESTADO DEL SISTEMA DE GESTIÓN DE CORRESPONDENCIA SIGEC',
                    documentType: 'Nota Interna',
                    sender: 'Edwin Yujra (Jefe de Unidad TIC)',
                    status: 'Recibido',
                    receptionDate: new Date(Date.now() - 86400000).toISOString(),
                },
            ]
    );

    const [filterQuery, setFilterQuery] = useState('');
    const [filterType, setFilterType] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'WITH_ROUTE' | 'WITHOUT_ROUTE'>('WITH_ROUTE');

    // New Document Form State
    const [docType, setDocType] = useState('Informe');
    const [subject, setSubject] = useState('');
    const [recipient, setRecipient] = useState('');
    const [via, setVia] = useState('');
    const [attachment, setAttachment] = useState('');
    const [pageCount, setPageCount] = useState('1');
    const [successMessage, setSuccessMessage] = useState('');

    const handleCreateDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) return;

        const dateYear = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const prefix = docType === 'Informe' ? 'INF' : docType === 'Nota Interna' ? 'NOT' : docType === 'Carta' ? 'CAR' : 'CIR';
        const citeCode = modalMode === 'WITH_ROUTE' 
            ? `AEV/DNP/${prefix}/Nro.${randomNum}/${dateYear}` 
            : `BORRADOR-${prefix}-${randomNum}`;
        const trackingId = `DOC-ORGA-${randomNum}`;

        const newDoc: DocumentItem = {
            id: `doc-gen-${Date.now()}`,
            trackingId: trackingId,
            trackingCode: citeCode,
            subject: subject.trim().toUpperCase(),
            documentType: docType,
            sender: recipient || 'Servidor Público Responsable',
            status: modalMode === 'WITH_ROUTE' ? 'En Proceso' : 'Borrador Sin Hoja de Ruta',
            receptionDate: new Date().toISOString(),
        };

        // TEMPORARY: Save only in client memory (localStorage) until DB issue is fixed
        const updatedDocs = [newDoc, ...documents];
        setDocuments(updatedDocs);

        // Persist in localStorage so it survives navigation
        try {
            localStorage.setItem(`generated-docs-${organizationId}`, JSON.stringify(updatedDocs));
        } catch (e) {
            console.warn('Could not save to localStorage');
        }

        setSuccessMessage(`¡Documento ${citeCode} generado exitosamente! (guardado temporalmente)`);

        setIsModalOpen(false);

        // Reset form
        setSubject('');
        setRecipient('');
        setVia('');
        setAttachment('');
        setPageCount('1');

        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const filteredDocs = documents.filter(doc => {
        const matchesQuery = !filterQuery || 
            (doc.subject && doc.subject.toLowerCase().includes(filterQuery.toLowerCase())) ||
            (doc.trackingCode && doc.trackingCode.toLowerCase().includes(filterQuery.toLowerCase())) ||
            (doc.trackingId && doc.trackingId.toLowerCase().includes(filterQuery.toLowerCase()));

        const matchesType = filterType === 'Todos' || doc.documentType === filterType;

        return matchesQuery && matchesType;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-white">Gestión y Generación de Documentos</h1>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                            SIGEC Módulo 11
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        Cree Informes, Notas Internas, Cartas y Circulares con CITE oficial y Hoja de Ruta automatizada.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => {
                            setModalMode('WITH_ROUTE');
                            setIsModalOpen(true);
                        }}
                        className="px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                    >
                        <span>+ Generar Documento Con Hoja de Ruta</span>
                    </button>

                    <button
                        onClick={() => {
                            setModalMode('WITHOUT_ROUTE');
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-3 rounded-xl font-semibold text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        <span>+ Generar Sin Hoja de Ruta</span>
                    </button>
                </div>
            </div>

            {/* Notification message */}
            {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            placeholder="Buscar por Asunto, CITE o N° Seguimiento..."
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300">Tipo:</span>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 outline-none"
                        >
                            <option value="Todos">Todos los tipos</option>
                            <option value="Informe">Informe (INF)</option>
                            <option value="Nota Interna">Nota Interna (NOT)</option>
                            <option value="Carta">Carta (CAR)</option>
                            <option value="Circular">Circular (CIR)</option>
                        </select>
                    </div>
                </div>

                <div className="text-xs font-mono text-slate-300">
                    Total: <span className="text-cyan-400 font-bold">{filteredDocs.length}</span> documentos
                </div>
            </div>

            {/* Document Table */}
            <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white">Listado de Documentos Generados</h2>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        Organización: {organizationId}
                    </span>
                </div>

                {filteredDocs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                        <div className="text-3xl">📄</div>
                        <div className="text-sm font-semibold text-slate-200">No se encontraron documentos</div>
                        <p className="text-xs text-slate-400">Genere un nuevo documento con o sin hoja de ruta usando los botones superiores.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-300 font-mono uppercase tracking-wider">
                                    <th className="py-3 px-4 font-semibold">CITE / N° Hoja Ruta</th>
                                    <th className="py-3 px-4 font-semibold">Asunto</th>
                                    <th className="py-3 px-4 font-semibold">Tipo</th>
                                    <th className="py-3 px-4 font-semibold">Destinatario / Remitente</th>
                                    <th className="py-3 px-4 font-semibold">Estado</th>
                                    <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-900/60 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                                            {doc.trackingCode || doc.trackingId || 'CITE-PENDIENTE'}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">
                                            {doc.subject}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                                                {doc.documentType || 'Documento'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-300 font-medium">{doc.sender || 'Ventanilla Única'}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {doc.status || 'Registrado'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right space-x-2">
                                            <Link
                                                href={`/documents/${doc.id}`}
                                                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 transition-all inline-block"
                                            >
                                                Ver Detalle
                                            </Link>
                                            <a
                                                href={`/api/documents/${doc.id}/template`}
                                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 transition-all inline-block"
                                            >
                                                Word 📥
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Document Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-xl glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-cyan-500/40 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {modalMode === 'WITH_ROUTE' ? 'Generar Documento Con Hoja de Ruta' : 'Generar Documento Sin Hoja de Ruta'}
                                </h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    {modalMode === 'WITH_ROUTE' 
                                        ? 'Asigna código CITE oficial y habilita el seguimiento jerárquico.'
                                        : 'Genera borrador documental sin registro de hoja de ruta previa.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateDocument} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Documento</label>
                                <select
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                >
                                    <option value="Informe">Informe (INF)</option>
                                    <option value="Nota Interna">Nota Interna (NOT)</option>
                                    <option value="Carta">Carta (CAR)</option>
                                    <option value="Circular">Circular (CIR)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Referencia / Asunto del Documento *</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Ingrese la referencia o resumen del documento..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre / Cargo Destinatario</label>
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="Ej: Juan José Espejo (Director General)"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Vía (Aprobador Inmediato)</label>
                                    <input
                                        type="text"
                                        value={via}
                                        onChange={(e) => setVia(e.target.value)}
                                        placeholder="Ej: Edwin Yujra (Jefe TIC)"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Adjuntos (Ej: 2 CDs, Fotografías)</label>
                                    <input
                                        type="text"
                                        value={attachment}
                                        onChange={(e) => setAttachment(e.target.value)}
                                        placeholder="Detalle de adjuntos físicos..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">N° de Hojas</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={pageCount}
                                        onChange={(e) => setPageCount(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 transition-all"
                                >
                                    Guardar y Generar Documento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
