'use client';

import * as React from 'react';
import Link from 'next/link';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';

export type Expediente = {
    id: string;
    code: string;
    subject: string;
    status: string;
    createdAt: string;
    documentCount?: number;
};

interface ExpedientesDataTableProps {
    data: Expediente[];
}

export function ExpedientesDataTable({ data }: ExpedientesDataTableProps) {
    if (data.length === 0) {
        return (
            <div className="rounded-md border flex items-center justify-center h-24">
                <p className="text-gray-500">No se encontraron expedientes.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Asunto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Documentos</TableHead>
                        <TableHead>Fecha de Creación</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((exp) => (
                        <TableRow key={exp.id}>
                            <TableCell className="font-medium">
                                <Link href={`/dashboard/expedientes/${exp.id}`} className="text-blue-600 hover:underline">
                                    {exp.code}
                                </Link>
                            </TableCell>
                            <TableCell>{exp.subject}</TableCell>
                            <TableCell>{exp.status}</TableCell>
                            <TableCell>{exp.documentCount ?? 0}</TableCell>
                            <TableCell>{new Date(exp.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
