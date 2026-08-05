'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type CiteConfigModalProps = {
    onSaved?: () => void;
};

export function CiteConfigModal({ onSaved }: CiteConfigModalProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [formatPattern, setFormatPattern] = React.useState('{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO:4}/{AÑO}');
    const [documentType, setDocumentType] = React.useState('');
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [resetYearly, setResetYearly] = React.useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/cites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formatPattern,
                    documentType: documentType || null,
                    year: Number(year),
                    resetYearly,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al guardar la regla de CITE.');
            }

            setIsOpen(false);
            if (onSaved) onSaved();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar la regla.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-9 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nueva Regla de CITE
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <form onSubmit={handleSubmit} className="bg-background border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">Configurar Patrón de CITE</h3>
                        <p className="text-xs text-muted-foreground">
                            Defina cómo se formateará la nomenclatura oficial de correspondencia para la entidad o un tipo específico de documento.
                        </p>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Patrón de CITE (Sintaxis Dinámica)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formatPattern}
                                    onChange={(e) => setFormatPattern(e.target.value)}
                                    placeholder="{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO:4}/{AÑO}"
                                    className="w-full h-9 px-3 text-sm font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Variables disponibles: <code className="bg-muted px-1 rounded">{'{ENTIDAD}'}</code>, <code className="bg-muted px-1 rounded">{'{AREA}'}</code>, <code className="bg-muted px-1 rounded">{'{TIPO}'}</code>, <code className="bg-muted px-1 rounded">{'{NUMERO:4}'}</code>, <code className="bg-muted px-1 rounded">{'{AÑO}'}</code>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                        Tipo de Documento (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value)}
                                        placeholder="Ej: Informe (o vacío para todos)"
                                        className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                        Gestión / Año
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="resetYearly"
                                    checked={resetYearly}
                                    onChange={(e) => setResetYearly(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="resetYearly" className="text-xs font-medium text-muted-foreground">
                                    Reiniciar secuencia automáticamente al cambiar de año fiscal
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading ? 'Guardando...' : 'Guardar Regla'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
