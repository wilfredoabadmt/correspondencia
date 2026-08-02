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
import { createUser } from '~/app/admin/users/_actions';

type CreateUserFormProps = {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: (user: User, temporaryPassword: string) => void;
};

export function CreateUserForm({ isOpen, onClose, onUserCreated }: CreateUserFormProps) {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<UserRole>('OPERADOR');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await createUser(name, email, role);
            onUserCreated(result.user, result.temporaryPassword);
            setName('');
            setEmail('');
            setRole('OPERADOR');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al crear el usuario.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                        Crea una nueva cuenta de usuario para tu organización.
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
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            placeholder="email@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}