import { describe, it, expect } from 'vitest';
import { KpiCard } from './kpi-card';

const DummyIcon = ({ className }: { className?: string }) => <svg className={className} />;

describe('KpiCard', () => {
    it('should be defined with valid props', () => {
        const title = 'Total de Ventas';
        const value = '1,234';
        const card = KpiCard({ title, value, icon: DummyIcon });
        expect(card).toBeDefined();
    });
});