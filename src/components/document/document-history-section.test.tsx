import { describe, it, expect } from 'vitest';
import { DocumentHistorySection } from './document-history-section';

describe('DocumentHistorySection', () => {
    it('should be defined', () => {
        expect(DocumentHistorySection).toBeDefined();
        expect(typeof DocumentHistorySection).toBe('function');
    });
});