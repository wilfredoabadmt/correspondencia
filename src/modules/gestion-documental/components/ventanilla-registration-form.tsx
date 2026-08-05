'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type AreaOption = {
    id: string;
    name: string;
    code: string;
};

export function VentanillaRegistrationForm({ areas }: { areas: AreaOption[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [successDoc, setSuccessDoc] = React.useState<{ id: string; trackingCode: string } | null>(null);

    const [applicantName, setApplicantName] = React.useState('');
    const [applicantIdentityDocument, setApplicantIdentityDocument] = React.useState('');
    const [applicantInstitution, setApplicantInstitution] = React.useState('');
    const [applicantPhone, setApplicantPhone] = React.useState('');
    const [applicantEmail, setApplicantEmail] = React.useState('');
    const [subject, setSubject] = React.useState('');
    const [documentType, setDocumentType] = React.useState('Carta Externa');
    const [areaHierarchyId, setAreaHierarchyId] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessDoc(null);

        try {
            const res = await fetch('/api/documents/external', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicantName,
                    applicantIdentityDocument: applicantIdentityDocument || null,
                    applicantInstitution: applicantInstitution || null,
                    applicantPhone: applicantPhone || null,
                    applicantEmail: applicantEmail || null,
                    subject,
                    documentType,
                    areaHierarchyId,
                    receptionDate: new Date().toISOString(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al registrar la correspondencia externa.');
            }

            setSuccessDoc({ id: data.id, trackingCode: data.trackingCode });
            setApplicantName('');
            setApplicantIdentityDocument('');
            setApplicantInstitution('');
            setApplicantPhone('');
            setApplicantEmail('');
            setSubject('');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {successDoc && (
                <div className="p-6 bg-emerald-950/40 border border-emerald-800 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                            ✓
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-emerald-200">¡Trámite Registrado Exitosamente!</h3>
                            <p className="text-xs text-emerald-300">CITE Asignado: <span className="font-mono font-bold">{successDoc.trackingCode}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <a
                            href={`/api/documents/${successDoc.id}/receipt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h55.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Imprimir / Descargar Recibo PDF
                        </a>
                        <button
                            type="button"
                            onClick={() => setSuccessDoc(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl"
                        >
                            Registrar Otro Documento
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">Datos del Remitente Externo / Ciudadano</h2>

                {error && (
                    <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                        <label className="text-slate-300 font-medium">Nombre Completo del Solicitante *</label>
                        <input
                            type="text"
                            required
                            value={applicantName}
                            onChange={(e) => setApplicantName(e.target.value)}
                            placeholder="Ej. Juan Pérez Mamani"
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-300 font-medium">Documento de Identidad (CI / NIT)</label>
                        <input
                            type="text"
                            value={applicantIdentityDocument}
                            onChange={(e) => setApplicantIdentityDocument(e.target.value)}
                            placeholder="Ej. 6543210 LP"
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-300 font-medium">Institución / Empresa Remitente</label>
                        <input
                            type="text"
                            value={applicantInstitution}
                            onChange={(e) => setApplicantInstitution(e.target.value)}
                            placeholder="Ej. Junta Vecinal / Consultora A"
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-300 font-medium">Teléfono / Celular de Contacto</label>
                        <input
                            type="text"
                            value={applicantPhone}
                            onChange={(e) => setApplicantPhone(e.target.value)}
                            placeholder="Ej. 76543210"
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-slate-300 font-medium">Correo Electrónico (Notificaciones de seguimiento)</label>
                        <input
                            type="email"
                            value={applicantEmail}
                            onChange={(e) => setApplicantEmail(e.target.value)}
                            placeholder="juan.perez@example.com"
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3 pt-4">Datos del Documento Ingresado</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-slate-300 font-medium">Asunto / Referencia del Trámite *</label>
                        <textarea
                            required
                            rows={3}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Describa el contenido y propósito del documento..."
                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-300 font-medium">Tipo de Documento *</label>
                        <input
                            type="text"
                            required
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            placeholder="Ej. Carta Externa, Solicitud, Memorial"
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-slate-300 font-medium">Área Destino Inicial *</label>
                        <select
                            required
                            value={areaHierarchyId}
                            onChange={(e) => setAreaHierarchyId(e.target.value)}
                            className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500"
                        >
                            <option value="">Seleccione el área de destino...</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>{area.name} ({area.code})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? 'Registrando Trámite...' : 'Registrar e Imprimir Recibo'}
                    </button>
                </div>
            </form>
        </div>
    );
}
