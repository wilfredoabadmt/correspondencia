'use client';

import * as React from 'react';
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
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export function CrearExpedienteModal() {
    // TODO: Implementar react-hook-form y zod para validación
    // TODO: Implementar la llamada a la API para crear el expediente

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Crear Nuevo Expediente</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Expediente</DialogTitle>
                    <DialogDescription>
                        Rellena los datos para crear un nuevo expediente. Haz clic en guardar cuando hayas terminado.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                            Asunto
                        </Label>
                        <Input id="subject" className="col-span-3" />
                    </div>
                    {/* TODO: Añadir más campos si es necesario */}
                </div>
                <DialogFooter>
                    <Button type="submit">Guardar Expediente</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
