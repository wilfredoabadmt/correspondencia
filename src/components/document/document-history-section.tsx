'use client';

import * as React from 'react';
import { DocumentHistoryTimeline } from './document-history-timeline';
import { getPaginatedDocumentHistory } from '~/app/documents/[documentId]/_actions'; // Import the server action
import type { HistoryEntry, PaginatedHistory } from '~/modules/gestion-documental/core/document-history.repository';

type DocumentHistorySectionProps = {
    documentId: string;
    initialHistory?: HistoryEntry[];
    initialHasMore?: boolean;
    initialPaginatedHistory?: PaginatedHistory;
};

const DEFAULT_LIMIT = 10;

export function DocumentHistorySection({
    documentId,
    initialHistory = [],
    initialHasMore = false,
    initialPaginatedHistory,
}: DocumentHistorySectionProps) {
    const effectiveHistory = initialPaginatedHistory?.history ?? initialHistory;
    const effectiveHasMore = initialPaginatedHistory?.hasMore ?? initialHasMore;

    const [history, setHistory] = React.useState<HistoryEntry[]>(effectiveHistory);
    const [offset, setOffset] = React.useState<number>(effectiveHistory.length);
    const [hasMore, setHasMore] = React.useState<boolean>(effectiveHasMore);
    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
    const [loadMoreError, setLoadMoreError] = React.useState<string | null>(null);

    const onLoadMore = React.useCallback(async () => {
        if (isLoadingMore || !hasMore) {
            return;
        }

        setIsLoadingMore(true);
        setLoadMoreError(null);

        try {
            const newPaginatedHistory: PaginatedHistory = await getPaginatedDocumentHistory(
                documentId,
                DEFAULT_LIMIT,
                offset,
            );

            setHistory((prevHistory) => [...prevHistory, ...newPaginatedHistory.history]);
            setOffset((prevOffset) => prevOffset + newPaginatedHistory.history.length);
            setHasMore(newPaginatedHistory.hasMore);
        } catch (error) {
            console.error('Error loading more document history:', error);
            setLoadMoreError('No se pudo cargar más historial. Inténtalo de nuevo.');
        } finally {
            setIsLoadingMore(false);
        }
    }, [documentId, offset, hasMore, isLoadingMore]);

    React.useEffect(() => {
        setHistory(effectiveHistory);
        setOffset(effectiveHistory.length);
        setHasMore(effectiveHasMore);
        setIsLoadingMore(false);
        setLoadMoreError(null);
    }, [documentId, initialHistory, initialHasMore, initialPaginatedHistory]);

    return (
        <DocumentHistoryTimeline
            history={history}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            isLoadingMore={isLoadingMore}
            loadMoreError={loadMoreError}
        />
    );
}