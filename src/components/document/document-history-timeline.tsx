import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import type { HistoryEntry } from '~/modules/gestion-documental/core/document-history.repository';

type DocumentHistoryTimelineProps = {
    history: HistoryEntry[];
    hasMore?: boolean;
    onLoadMore?: () => Promise<void>;
    isLoadingMore?: boolean;
    loadMoreError?: string | null;
};

export function DocumentHistoryTimeline({
    history,
    hasMore = false,
    onLoadMore,
    isLoadingMore = false,
    loadMoreError,
}: DocumentHistoryTimelineProps) {
    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return 'N/A';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
                {!history || history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Este documento aún no tiene historial de movimientos.
                    </p>
                ) : (
                    <div className="relative border-l border-muted pl-6 space-y-6">
                        <ul role="list" aria-live="polite" className="space-y-6">
                            {history.map((entry, index) => (
                                <li key={entry.id || index} className="relative">
                                    <span className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            {entry.fromAreaName ? (
                                                <>
                                                    {entry.fromAreaName} &rarr; <span className="text-primary">{entry.toAreaName}</span>
                                                </>
                                            ) : (
                                                <>
                                                    Derivado a <span className="text-primary">{entry.toAreaName}</span>
                                                </>
                                            )}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(entry.createdAt)}
                                        </span>
                                    </div>
                                    {entry.userName && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Responsable: <span className="font-medium">{entry.userName}</span>
                                        </p>
                                    )}
                                    {entry.comment && (
                                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2.5 rounded-md border border-muted/80">
                                            &ldquo;{entry.comment}&rdquo;
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {hasMore && onLoadMore && (
                            <div className="pt-2">
                                {loadMoreError && (
                                    <p className="text-xs text-destructive mb-2">{loadMoreError}</p>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onLoadMore}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    Cargar más
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
