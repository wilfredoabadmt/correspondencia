import { describe, it, expect } from 'vitest';
import { getSemaphoreInfo } from './deadline.utils';

describe('deadline.utils getSemaphoreInfo', () => {
    it('debe retornar NORMAL para fechas recientes (0 a 2 días)', () => {
        const today = new Date();
        const info = getSemaphoreInfo(today);
        expect(info.level).toBe('NORMAL');
        expect(info.daysElapsed).toBe(0);
    });

    it('debe retornar WARNING para trámites de 3 a 4 días', () => {
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

        const info = getSemaphoreInfo(fourDaysAgo);
        expect(info.level).toBe('WARNING');
        expect(info.daysElapsed).toBe(4);
    });

    it('debe retornar OVERDUE para trámites con 5 o más días', () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const info = getSemaphoreInfo(tenDaysAgo);
        expect(info.level).toBe('OVERDUE');
        expect(info.daysElapsed).toBe(10);
        expect(info.label).toContain('Vencido');
    });
});
