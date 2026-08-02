import { vi, describe, it, expect } from 'vitest';
import { PaginationControls } from './pagination-controls';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: vi.fn() }),
    usePathname: () => '/documents',
    useSearchParams: () => new URLSearchParams(),
}));

describe('PaginationControls', () => {
    it('should render component correctly', () => {
        const controls = PaginationControls({ currentPage: 1, totalPages: 5, total: 50 });
        expect(controls).toBeDefined();
    });
});