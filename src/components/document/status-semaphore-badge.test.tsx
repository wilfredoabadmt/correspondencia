import { describe, it, expect } from 'vitest';
import { StatusSemaphoreBadge } from './status-semaphore-badge';

describe('StatusSemaphoreBadge', () => {
    it('debe renderizar la insignia correctamente con la fecha especificada', () => {
        const component = StatusSemaphoreBadge({ startDate: new Date() });
        expect(component).toBeDefined();
    });
});
