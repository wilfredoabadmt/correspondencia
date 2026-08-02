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
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import type { User, UserRole } from '~/modules/users/core/user.repository';
import { updateUser } from '~/app/admin/users/_actions';

type EditUserFormProps = {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUserUpdated: (updatedUser: User) => void;
};

export function EditUserForm({ isOpen, onClose, user, onUserUpdated }: EditUserFormProps) {
    const [name, setName] = React.useState(user.name || '');
    const [role, setRole] = React.useState<UserRole>((user.role as UserRole) || 'OPERADOR');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setName(user.name || '');
        setRole((user.role as UserRole) || 'OPERADOR');
    }, [user]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const updatedUser = await updateUser(user.id, name, role);
            if (updatedUser) {
                onUserUpdated(updatedUser);
                onClose();
            } else {
                setError('No se pudo actualizar el usuario.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al actualizar el usuario.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del usuario {user.email}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Nombre</label>
                        <Input
                            placeholder="Nombre del usuario"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Rol</label>
                        <Select value={role} onValueChange={(val: string) => setRole(val as UserRole)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OPERADOR">Operador</SelectItem>
                                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}