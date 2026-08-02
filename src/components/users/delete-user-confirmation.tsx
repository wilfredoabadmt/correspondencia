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
import type { User } from '~/modules/users/core/user.repository';
import { deleteUser } from '~/app/admin/users/_actions';

type DeleteUserConfirmationProps = {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUserDeleted: (userId: string) => void;
};

export function DeleteUserConfirmation({ isOpen, onClose, user, onUserDeleted }: DeleteUserConfirmationProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function handleDelete() {
        setIsDeleting(true);
        setError(null);
        try {
            await deleteUser(user.id);
            onUserDeleted(user.id);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al eliminar el usuario.');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>¿Estás absolutamente seguro?</DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de usuario de {user.email} y revocará su acceso a la organización.
                    </DialogDescription>
                </DialogHeader>
                {error && <p className="text-sm text-destructive px-4">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}