import { vi, describe, it, expect } from 'vitest';
import { DocumentsToolbar } from './documents-toolbar';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: vi.fn() }),
    usePathname: () => '/documents',
    useSearchParams: () => new URLSearchParams(),
}));

describe('DocumentsToolbar', () => {
    it('should be defined', () => {
        expect(DocumentsToolbar).toBeDefined();
    });
});