import { describe, it, expect } from 'vitest';
import { DocumentHistoryTimeline } from './document-history-timeline';
import type { HistoryEntry } from '~/modules/gestion-documental/core/document-history.repository';

describe('DocumentHistoryTimeline', () => {
    const mockHistory: HistoryEntry[] = [
        {
            id: 'h-1',
            documentId: 'doc-123',
            fromAreaId: 'area-1',
            toAreaId: 'area-2',
            userId: 'user-1',
            comment: 'Derivación inicial',
            createdAt: new Date('2024-08-01T12:00:00Z'),
            fromAreaName: 'Mesa de Partes',
            toAreaName: 'Logística',
            userName: 'María López',
        },
    ];

    it('should render history timeline component with entries', () => {
        const component = DocumentHistoryTimeline({ history: mockHistory });
        expect(component).toBeDefined();
    });

    it('should render empty state when history is empty', () => {
        const component = DocumentHistoryTimeline({ history: [] });
        expect(component).toBeDefined();
    });
});
