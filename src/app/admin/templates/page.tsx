'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SystemShell } from '~/components/layout/SystemShell';
import {
    listDocumentTemplates,
    uploadDocumentTemplate,
    setActiveTemplate,
    deleteDocumentTemplate,
    updateDocumentTemplate,
    replaceTemplateFile,
    type DocumentTemplateModel,
} from './_actions';

const DOCUMENT_TYPES = [
    { code: 'INF', label: 'Informe Técnico', icon: '📄', color: 'cyan' },
    { code: 'NOT', label: 'Nota Interna', icon: '📝', color: 'blue' },
    { code: 'CAR', label: 'Carta Oficial', icon: '✉️', color: 'emerald' },
    { code: 'MEM', label: 'Memorándum', icon: '📋', color: 'purple' },
    { code: 'CIR', label: 'Circular', icon: '📢', color: 'amber' },
    { code: 'INS', label: 'Instructivo', icon: '📌', color: 'rose' },
] as const;

export default function TemplatesManagementPage() {
    const [templates, setTemplates] = useState<DocumentTemplateModel[]>([]);
    const [filterType, setFilterType] = useState<string>('TODOS');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [documentType, setDocumentType] = useState<'INF' | 'NOT' | 'CAR' | 'MEM' | 'CIR' | 'INS'>('INF');
    const [version, setVersion] = useState('v1.0');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<DocumentTemplateModel | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editVersion, setEditVersion] = useState('');
    const [editType, setEditType] = useState<'INF' | 'NOT' | 'CAR' | 'MEM' | 'CIR' | 'INS'>('INF');

    // Replace file modal state
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [replacingTemplate, setReplacingTemplate] = useState<DocumentTemplateModel | null>(null);
    const [replaceFile, setReplaceFile] = useState<File | null>(null);
    const [replaceVersion, setReplaceVersion] = useState('');

    const openEditModal = (template: DocumentTemplateModel) => {
        setEditingTemplate(template);
        setEditTitle(template.title);
        setEditVersion(template.version);
        setEditType(template.documentType);
        setIsEditModalOpen(true);
    };

    const openReplaceModal = (template: DocumentTemplateModel) => {
        setReplacingTemplate(template);
        setReplaceFile(null);
        setReplaceVersion(template.version);
        setIsReplaceModalOpen(true);
    };

    const handleReplaceFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replacingTemplate || !replaceFile) return;

        try {
            setSubmitting(true);
            setMessage(null);
            const formData = new FormData();
            formData.append('file', replaceFile);
            formData.append('version', replaceVersion);

            await replaceTemplateFile(replacingTemplate.id, formData);
            setMessage(`Modelo de plantilla "${replacingTemplate.title}" reemplazado correctamente.`);
            setIsReplaceModalOpen(false);
            setReplacingTemplate(null);
            setReplaceFile(null);
            await loadTemplates();
        } catch (err: any) {
            setMessage(`Error al reemplazar el modelo: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate) return;

        try {
            setSubmitting(true);
            setMessage(null);
            await updateDocumentTemplate(editingTemplate.id, {
                title: editTitle.trim(),
                version: editVersion.trim(),
                documentType: editType,
            });
            setMessage(`Plantilla "${editTitle.trim()}" actualizada correctamente.`);
            setIsEditModalOpen(false);
            setEditingTemplate(null);
            await loadTemplates();
        } catch (err: any) {
            setMessage(`Error al actualizar la plantilla: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await listDocumentTemplates();
            setTemplates(data);
        } catch {
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            setSubmitting(true);
            setMessage(null);
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('documentType', documentType);
            formData.append('version', version);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const created = await uploadDocumentTemplate(formData);
            setMessage(`¡Plantilla "${created.title}" subida con éxito y establecida como activa para ${created.documentType}!`);
            setIsUploadModalOpen(false);
            setTitle('');
            setSelectedFile(null);
            await loadTemplates();
        } catch (err: any) {
            setMessage(`Error al subir la plantilla: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetActive = async (id: string, tTitle: string) => {
        try {
            await setActiveTemplate(id);
            setMessage(`Plantilla "${tTitle}" establecida como activa por defecto.`);
            await loadTemplates();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (id: string, tTitle: string) => {
        if (!confirm(`¿Está seguro de eliminar el modelo de plantilla "${tTitle}"?`)) return;
        try {
            await deleteDocumentTemplate(id);
            setMessage(`Plantilla "${tTitle}" eliminada.`);
            await loadTemplates();
        } catch (err: any) {
            setMessage(`Error al eliminar: ${err.message}`);
        }
    };

    const filteredTemplates = filterType === 'TODOS'
        ? templates
        : templates.filter(t => t.documentType === filterType);

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
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Gestión de Plantillas Word (.docx)</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    📜 Módulo Super Usuario
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1">
                                Administre los modelos oficiales en Word (.docx) para Informes, Notas Internas, Cartas, Memorándums, Circulares e Instructivos.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="w-full md:w-auto px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                    >
                        <span>+ Subir Nueva Plantilla Word</span>
                    </button>
                </div>

                {/* Notification Alert */}
                {message && (
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center justify-between gap-3">
                        <span className="font-mono">{message}</span>
                        <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                    </div>
                )}

                {/* Type Filter Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setFilterType('TODOS')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            filterType === 'TODOS'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        🌐 Todos ({templates.length})
                    </button>
                    {DOCUMENT_TYPES.map(type => {
                        const count = templates.filter(t => t.documentType === type.code).length;
                        const isSelected = filterType === type.code;
                        return (
                            <button
                                key={type.code}
                                onClick={() => setFilterType(type.code)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                                }`}
                            >
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 font-mono text-slate-300">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-mono text-xs">Cargando modelos de plantillas Word...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => {
                            const typeObj = DOCUMENT_TYPES.find(t => t.code === template.documentType) || { label: template.documentType, icon: '📄', color: 'cyan' };
                            return (
                                <div key={template.id} className="glass-panel-glow p-6 rounded-3xl space-y-4 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 text-cyan-300 border border-slate-700 flex items-center gap-1.5">
                                                <span>{typeObj.icon}</span>
                                                <span>{typeObj.label} ({template.documentType})</span>
                                            </span>

                                            {template.isActive ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                    ⭐ ACTIVA POR DEFECTO
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                                                    Inactiva
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-white line-clamp-2">{template.title}</h3>
                                            <p className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-2">
                                                <span>📦 {template.fileName}</span>
                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{template.version}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                            <span>Tamaño: {template.fileSize}</span>
                                            <span>Actualizado: {new Date(template.createdAt).toLocaleDateString('es-PE')}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`/api/documents/${template.id}/template`}
                                                download={template.fileName.endsWith('.docx') ? template.fileName : `${template.fileName}.docx`}
                                                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                                                title="Descargar o previsualizar la plantilla Word"
                                            >
                                                📥 Descargar .docx
                                            </a>

                                            {!template.isActive && (
                                                <button
                                                    onClick={() => handleSetActive(template.id, template.title)}
                                                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                                                    title="Establecer como activa por defecto"
                                                >
                                                    ⭐ Activar
                                                </button>
                                            )}

                                            <button
                                                onClick={() => openEditModal(template)}
                                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-colors"
                                                title="Editar plantilla"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                onClick={() => openReplaceModal(template)}
                                                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors"
                                                title="Reemplazar modelo .docx"
                                            >
                                                🔄
                                            </button>

                                            <button
                                                onClick={() => handleDelete(template.id, template.title)}
                                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
                                                title="Eliminar plantilla"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && editingTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-5 border border-blue-500/40 shadow-2xl animate-fadeIn">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-lg font-bold text-white">Editar Plantilla</h3>
                                <button onClick={() => { setIsEditModalOpen(false); setEditingTemplate(null); }} className="text-slate-400 hover:text-white font-bold">✕</button>
                            </div>

                            <form onSubmit={handleUpdateTemplate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Documento</label>
                                    <select
                                        value={editType}
                                        onChange={(e) => setEditType(e.target.value as any)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 outline-none"
                                    >
                                        <option value="INF">📄 Informe Técnico (INF)</option>
                                        <option value="NOT">📝 Nota Interna (NOT)</option>
                                        <option value="CAR">✉️ Carta Oficial (CAR)</option>
                                        <option value="MEM">📋 Memorándum (MEM)</option>
                                        <option value="CIR">📢 Circular Informativa (CIR)</option>
                                        <option value="INS">📌 Instructivo (INS)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Título de la Plantilla</label>
                                    <input
                                        type="text"
                                        required
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Versión</label>
                                    <input
                                        type="text"
                                        value={editVersion}
                                        onChange={(e) => setEditVersion(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditModalOpen(false); setEditingTemplate(null); }}
                                        className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-blue-600 hover:bg-blue-500"
                                    >
                                        {submitting ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-5 border border-cyan-500/40 shadow-2xl animate-fadeIn">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-lg font-bold text-white">Subir Nueva Plantilla Word (.docx)</h3>
                                <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Documento Oficial</label>
                                    <select
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value as any)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                    >
                                        <option value="INF">📄 Informe Técnico (INF)</option>
                                        <option value="NOT">📝 Nota Interna (NOT)</option>
                                        <option value="CAR">✉️ Carta Oficial (CAR)</option>
                                        <option value="MEM">📋 Memorándum (MEM)</option>
                                        <option value="CIR">📢 Circular Informativa (CIR)</option>
                                        <option value="INS">📌 Instructivo (INS)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Título de la Plantilla</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Plantilla Oficial de Memorándum 2026 v1.0"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Versión</label>
                                    <input
                                        type="text"
                                        value={version}
                                        onChange={(e) => setVersion(e.target.value)}
                                        placeholder="v1.0"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Archivo Word (.docx)</label>
                                    <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-4 text-center bg-slate-950/60 cursor-pointer transition-colors">
                                        <input
                                            type="file"
                                            accept=".docx,.doc"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2 font-mono">Formatos permitidos: .docx de Microsoft Word</p>
                                    </div>
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-blue-600 hover:bg-blue-500 shadow-md"
                                    >
                                        {submitting ? 'Subiendo...' : 'Subir Plantilla'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Replace File Modal */}
                {isReplaceModalOpen && replacingTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-5 border border-amber-500/40 shadow-2xl animate-fadeIn">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Reemplazar Modelo Word</h3>
                                    <p className="text-xs text-slate-400 mt-1">Actualice el archivo .docx de la plantilla <span className="text-amber-300 font-bold">{replacingTemplate.title}</span></p>
                                </div>
                                <button onClick={() => { setIsReplaceModalOpen(false); setReplacingTemplate(null); }} className="text-slate-400 hover:text-white font-bold">✕</button>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <span>📦</span>
                                    <span className="font-mono">{replacingTemplate.fileName}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{replacingTemplate.version}</span>
                                </div>
                            </div>

                            <form onSubmit={handleReplaceFile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Nuevo Modelo Word (.docx)</label>
                                    <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-4 text-center bg-slate-950/60 cursor-pointer transition-colors">
                                        <input
                                            type="file"
                                            accept=".docx,.doc"
                                            required
                                            onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                                            className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2 font-mono">Seleccione el nuevo modelo Word que reemplazará al actual</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Nueva Versión</label>
                                    <input
                                        type="text"
                                        value={replaceVersion}
                                        onChange={(e) => setReplaceVersion(e.target.value)}
                                        placeholder="v1.0"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-amber-500 outline-none"
                                    />
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => { setIsReplaceModalOpen(false); setReplacingTemplate(null); }}
                                        className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !replaceFile}
                                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-amber-600 hover:bg-amber-500 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Reemplazando...' : 'Reemplazar Modelo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </SystemShell>
    );
}
