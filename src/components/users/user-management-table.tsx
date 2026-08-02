'use client';

import * as React from 'react';
import type { User } from '~/modules/users/core/user.repository';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

type UserManagementTableProps = {
    initialUsers: User[];
};

export function UserManagementTable({ initialUsers }: UserManagementTableProps) {
    // En el futuro, aquí se gestionaría el estado de los usuarios, actualizaciones, etc.
    const [users, setUsers] = React.useState(initialUsers);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Usuarios de la Organización</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No hay usuarios registrados en esta organización.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell className="text-right">
                                        {/* TODO: Botones de Editar y Eliminar */}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}