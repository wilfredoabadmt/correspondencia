'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { JacobitusSlot } from '../core/jacobitus.service';

export function JacobitusSignModal({
    documentId,
    onSuccess,
}: {
    documentId: string;
    onSuccess?: () => void;
}) {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [slots, setSlots] = React.useState<JacobitusSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = React.useState<number>(1);
    const [pin, setPin] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            fetch('/api/admin/cites') // Dummy fetch trigger or direct slot simulation
                .then(() => {
                    setSlots([
                        { slot: 1, description: 'Token USB ADSIB (PKCS#11)', tokenName: 'eToken Pro' },
                        { slot: 2, description: 'Softoken Certificado Digital AGETIC', tokenName: 'Softoken FIDO' },
                    ]);
                })
                .catch(() => setSlots([]));
        }
    }, [isOpen]);

    const handleSign = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/documents/${documentId}/sign-jacobitus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slot: selectedSlot,
                    pin,
                    alias: 'cert-oficial',
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error al firmar con Jacobitus.');
            }

            setIsOpen(false);
            if (onSuccess) onSuccess();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar firma digital.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Firmar con Jacobitus / AGETIC
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                    🔑
                                </div>
                                <h3 className="text-base font-bold text-white">Firma Digital Jacobitus FIDO</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white text-xs font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSign} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="text-slate-300 font-semibold">Seleccionar Token / Dispositivo Certificador *</label>
                                <select
                                    value={selectedSlot}
                                    onChange={(e) => setSelectedSlot(Number(e.target.value))}
                                    className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500"
                                >
                                    {slots.map((s) => (
                                        <option key={s.slot} value={s.slot}>
                                            {s.description} ({s.tokenName})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-slate-300 font-semibold">PIN del Certificado / Token *</label>
                                <input
                                    type="password"
                                    required
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-mono"
                                />
                            </div>

                            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                                <p className="font-semibold text-slate-200">Sellado de Tiempo TSA (RFC 3161):</p>
                                <p>Se adjuntará un sello oficial de tiempo de la Autoridad Certificadora (ADSIB / AGETIC).</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? 'Firmando y Estampando TSA...' : 'Firmar Digitalmente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
