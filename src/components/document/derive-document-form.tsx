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

type DeriveDocumentFormProps = {
    documentId: string;
    currentAreaId: string | null;
    areas: Area[];
};

const initialState: DeriveFormState = {
    message: '',
    success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Derivando...' : 'Confirmar Derivación'}
        </Button>
    );
}

export function DeriveDocumentForm({ documentId, currentAreaId, areas }: DeriveDocumentFormProps) {
    const [state, formAction] = useFormState(deriveDocument, initialState);
    const [open, setOpen] = useState(false);
    const [selectedAreaId, setSelectedAreaId] = useState<string>('');

    const destinationAreas = areas.filter((area) => area.id !== currentAreaId);

    useEffect(() => {
        if (state.message && state.success) {
            toast.success(state.message);
            setOpen(false);
        } else if (state.message && !state.errors) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Derivar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Derivar Documento</DialogTitle>
                    <DialogDescription>
                        Seleccione el área de destino y añada un comentario si es necesario.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="documentId" value={documentId} />
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="toAreaId">Destino</Label>
                            <Select name="toAreaId" value={selectedAreaId} onValueChange={setSelectedAreaId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un área..." />
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
                                <p className="text-sm font-medium text-destructive">{state.errors.toAreaId[0]}</p>
                            )}
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="comment">Comentario (Proveído)</Label>
                            <Textarea
                                id="comment"
                                name="comment"
                                placeholder="Añadir instrucciones, resumen o proveído..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}