'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '~/components/ui/button';

type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    total: number;
};

export function PaginationControls({ currentPage, totalPages, total }: PaginationControlsProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
        params.set('page', page.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) {
        return (
            <div className="flex items-center justify-end">
                <div className="text-sm text-muted-foreground">Total de {total} registro(s).</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total de {total} registro(s).</div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                >
                    <span className="sr-only">Ir a la primera página</span>
                    <span className="h-4 w-4">«</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <span className="sr-only">Ir a la página anterior</span>
                    <span className="h-4 w-4">‹</span>
                </Button>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Página {currentPage} de {totalPages}
                </div>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    <span className="sr-only">Ir a la página siguiente</span>
                    <span className="h-4 w-4">›</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                >
                    <span className="sr-only">Ir a la última página</span>
                    <span className="h-4 w-4">»</span>
                </Button>
            </div>
        </div>
    );
}