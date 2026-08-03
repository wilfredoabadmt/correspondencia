import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GetDashboardDataUseCase } from './get-dashboard-data.use-case';
import {
    DashboardKpis,
    IDashboardRepository,
    RecentDocument,
} from '../core/dashboard.repository';

// Mock de la implementación del repositorio para aislar el caso de uso en la prueba.
class MockDashboardRepository implements IDashboardRepository {
    getKpis = vi.fn();
    getRecentDocuments = vi.fn();
}

describe('GetDashboardDataUseCase', () => {
    let useCase: GetDashboardDataUseCase;
    let mockRepository: MockDashboardRepository;

    beforeEach(() => {
        mockRepository = new MockDashboardRepository();
        // Instanciamos el caso de uso manualmente con el mock,
        // evitando el contenedor de DI para esta prueba unitaria.
        useCase = new GetDashboardDataUseCase(mockRepository);
    });

    it('should retrieve KPIs and recent documents for a given organization', async () => {
        // Arrange: Preparamos los datos de prueba y configuramos el mock.
        const organizationId = 'org-123';
        const mockKpis: DashboardKpis = {
            documentsToday: 5,
            pendingDocuments: 10,
            totalDocuments: 100,
            overdueDocuments: 2,
        };
        const mockRecentDocuments: RecentDocument[] = [
            {
                id: 'doc-1',
                trackingId: 'T-001',
                subject: 'Test Subject 1',
                receptionDate: new Date(),
            },
        ];

        mockRepository.getKpis.mockResolvedValue(mockKpis);
        mockRepository.getRecentDocuments.mockResolvedValue(mockRecentDocuments);

        // Act: Ejecutamos el caso de uso.
        const result = await useCase.execute({ organizationId });

        // Assert: Verificamos que el resultado sea el esperado y que se haya llamado al repositorio correctamente.
        expect(result.kpis).toEqual(mockKpis);
        expect(result.recentDocuments).toEqual(mockRecentDocuments);

        expect(mockRepository.getKpis).toHaveBeenCalledWith({ organizationId });
        expect(mockRepository.getRecentDocuments).toHaveBeenCalledWith({
            organizationId,
            limit: 10, // Verificamos que se use el límite definido en el caso de uso.
        });
    });
});