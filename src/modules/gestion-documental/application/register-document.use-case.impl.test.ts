import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { buildTrackingCode } from './register-document.use-case.impl';
import { DocumentType } from '../core/document.entity';

describe('buildTrackingCode', () => {
    it('should format the tracking code correctly with a low sequence number', () => {
        const result = buildTrackingCode(
            DocumentType.INFORME,
            'UE-APROCAM/PRCC-AR',
            1,
            2024
        );
        expect(result).toBe('INF/UE-APROCAM/PRCC-AR/00001-2024');
    });

    it('should format the tracking code correctly with a high sequence number', () => {
        const result = buildTrackingCode(
            DocumentType.MEMORANDUM,
            'DESPACHO/DIR-GEN',
            12345,
            2025
        );
        expect(result).toBe('MEM/DESPACHO/DIR-GEN/12345-2025');
    });
});

// Note: A full integration test for the `RegisterDocumentUseCase` class itself
// would be created in a separate file and would involve mocking the repositories.