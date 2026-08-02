import { describe, it, expect } from 'vitest';
import { RecentDocumentsTable } from './recent-documents-table';
import type { RecentDocument } from '@/modules/dashboard/core/dashboard.repository';

describe('RecentDocumentsTable', () => {
    const mockDocuments: RecentDocument[] = [
        {
            id: 'doc-1',
            trackingId: 'T-2024-001',
            subject: 'Solicitud de vacaciones',
            receptionDate: new Date('2024-07-29T10:00:00Z'),
        },
    ];

    it('should render component correctly', () => {
        const table = RecentDocumentsTable({ documents: mockDocuments });
        expect(table).toBeDefined();
    });
});