'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const DOCUMENT_STATUSES = ['Recibido', 'En Proceso', 'Archivado', 'Rechazado'];

function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay: number) {
    const timer = React.useRef<any>(null);
    return React.useCallback((...args: Parameters<T>) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => fn(...args), delay);
    }, [fn, delay]);
}

export function DocumentsToolbar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilterChange = (key: 'q' | 'status', value: string) => {
        const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
        params.set('page', '1');

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleSearch = useDebouncedCallback((term: string) => {
        handleFilterChange('q', term);
    }, 300);

    return (
        <div className="flex items-center justify-between gap-2">
            <Input
                placeholder="Buscar por código o asunto..."
                className="max-w-sm"
                defaultValue={searchParams?.get('q')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
                value={searchParams?.get('status')?.toString() ?? ''}
                onValueChange={(value: string) => handleFilterChange('status', value === 'all' ? '' : value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {DOCUMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                            {status}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}