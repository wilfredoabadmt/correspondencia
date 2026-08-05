'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

const toast = {
    success: (msg: string) => console.log('[Toast Success]:', msg),
    error: (msg: string) => console.error('[Toast Error]:', msg),
};

import { Button } from '~/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { deriveDocument, type DeriveFormState } from '@/actions';

type Area = { id: string; name: string };
type ProveidoOption = { id: string; code: string; description: string };

type DeriveDocumentFormProps = {
    documentId: string;
    currentAreaId: string | null;
    areas: Area[];
};

const initialState: DeriveFormState = {
    message: '',
    success: false,
};

function SubmitButton({ isMultidestination }: { isMultidestination?: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {pending ? 'Procesando Derivación...' : isMultidestination ? 'Confirmar Derivación Multidestino' : 'Confirmar Derivación'}
        </Button>
    );
}

export function DeriveDocumentForm({ documentId, currentAreaId, areas }: DeriveDocumentFormProps) {
    const [state, formAction] = useFormState(deriveDocument, initialState);
    const [open, setOpen] = useState(false);
    const [selectedAreaId, setSelectedAreaId] = useState<string>('');
    const [copyAreaIds, setCopyAreaIds] = useState<string[]>([]);
    const [proveidos, setProveidos] = useState<ProveidoOption[]>([]);
    const [selectedProveidos, setSelectedProveidos] = useState<string[]>([]);

    const destinationAreas = areas.filter((area) => area.id !== currentAreaId);

    useEffect(() => {
        if (open) {
            fetch('/api/admin/proveidos')
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setProveidos(data);
                })
                .catch(() => setProveidos([]));
        }
    }, [open]);

    useEffect(() => {
        if (state.message && state.success) {
            toast.success(state.message);
            setOpen(false);
        } else if (state.message && !state.errors) {
            toast.error(state.message);
        }
    }, [state]);

    const toggleProveido = (desc: string) => {
        setSelectedProveidos((prev) =>
            prev.includes(desc) ? prev.filter((item) => item !== desc) : [...prev, desc]
        );
    };

    const toggleCopyArea = (areaId: string) => {
        setCopyAreaIds((prev) =>
            prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                    Derivar Documento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Derivación Multidestino y Proveídos</DialogTitle>
                    <DialogDescription>
                        Seleccione el destinatario principal (Original), copias informativas e instrucciones institucionales.
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="documentId" value={documentId} />

                    {/* Original Destination */}
                    <div className="space-y-1.5">
                        <Label htmlFor="toAreaId" className="text-xs font-bold text-indigo-400">
                            🎯 Destinatario Principal (Original) *
                        </Label>
                        <Select name="toAreaId" value={selectedAreaId} onValueChange={setSelectedAreaId}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Seleccione el área titular..." />
                            </SelectTrigger>
                            <SelectContent>
                                {destinationAreas.map((area) => (
                                    <SelectItem key={area.id} value={area.id}>
                                        {area.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state.errors?.toAreaId && (
                            <p className="text-xs font-medium text-destructive">{state.errors.toAreaId[0]}</p>
                        )}
                    </div>

                    {/* Copias Informativas */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <Label className="text-xs font-bold text-cyan-400">
                            📋 Copias Informativas (Multidestino Secundario)
                        </Label>
                        <div className="max-h-32 overflow-y-auto p-2 border rounded-xl bg-slate-950/60 space-y-1 text-xs">
                            {destinationAreas
                                .filter((a) => a.id !== selectedAreaId)
                                .map((area) => (
                                    <label key={area.id} className="flex items-center gap-2 hover:bg-slate-900 p-1 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={copyAreaIds.includes(area.id)}
                                            onChange={() => toggleCopyArea(area.id)}
                                            className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-slate-300">{area.name}</span>
                                    </label>
                                ))}
                        </div>
                    </div>

                    {/* Proveídos Tipificados */}
                    {proveidos.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                            <Label className="text-xs font-bold text-emerald-400">
                                📌 Proveídos Estandarizados Institucionales
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs p-2 border rounded-xl bg-slate-950/60">
                                {proveidos.map((prov) => (
                                    <label key={prov.id} className="flex items-center gap-2 hover:bg-slate-900 p-1 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedProveidos.includes(prov.description)}
                                            onChange={() => toggleProveido(prov.description)}
                                            className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-slate-300 text-[11px] font-medium">{prov.description}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Observations */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <Label htmlFor="comment" className="text-xs font-semibold text-slate-300">
                            Observaciones Adicionales
                        </Label>
                        <Textarea
                            id="comment"
                            name="comment"
                            rows={3}
                            placeholder="Detalles o especificaciones adicionales para los destinatarios..."
                            className="text-xs bg-slate-950 border-slate-700 text-white"
                        />
                        {selectedProveidos.length > 0 && (
                            <p className="text-[11px] text-emerald-400">
                                Se incluirá: {selectedProveidos.join('; ')}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <SubmitButton isMultidestination={copyAreaIds.length > 0} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}