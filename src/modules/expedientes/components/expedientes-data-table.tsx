'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';

// TODO: Definir el tipo de dato para un expediente cuando la API esté lista.
// Por ahora, usamos un tipo genérico.
export type Expediente = {
    id: string;
    code: string;
    subject: string;
    status: string;
    createdAt: string;
};

export const columns: ColumnDef<Expediente>[] = [
    {
        accessorKey: 'code',
        header: 'Código',
        cell: ({ row }) => {
            const expediente = row.original;
            return (
                <Link href={`/dashboard/expedientes/${expediente.id}`} className="text-blue-600 hover:underline">
                    {expediente.code}
                </Link>
            );
        },
    },
    {
        accessorKey: 'subject',
        header: 'Asunto',
    },
    {
        accessorKey: 'status',
        header: 'Estado',
    },
    {
        accessorKey: 'createdAt',
        header: 'Fecha de Creación',
        cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
];

interface ExpedientesDataTableProps {
    // TODO: Usar el tipo de dato correcto cuando esté disponible
    data: Expediente[];
}

export function ExpedientesDataTable({ data }: ExpedientesDataTableProps) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No se encontraron expedientes.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
