import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateNextCiteUseCase } from './generate-next-cite.use-case';
import type { ICiteConfigRepository } from '../core/cite-config.repository';

describe('GenerateNextCiteUseCase', () => {
    let repository: ICiteConfigRepository;
    let useCase: GenerateNextCiteUseCase;

    beforeEach(() => {
        repository = {
            findByParams: vi.fn(),
            listByOrganization: vi.fn(),
            upsert: vi.fn(),
            incrementSequence: vi.fn(),
        };

        useCase = new GenerateNextCiteUseCase(repository);
    });

    it('debe formatear correctamente las variables dinámicas de CITE', async () => {
        vi.mocked(repository.findByParams).mockResolvedValue({
            id: 'cfg-1',
            organizationId: 'org-1',
            areaId: 'area-1',
            documentType: 'Informe',
            formatPattern: '{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO:4}/{AÑO}',
            currentSequence: 5,
            year: 2026,
            resetYearly: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        vi.mocked(repository.incrementSequence).mockResolvedValue(6);

        const result = await useCase.execute({
            organizationId: 'org-1',
            areaId: 'area-1',
            documentType: 'Informe',
            areaCode: 'DTI',
            orgCode: 'MIN',
            year: 2026,
        });

        expect(result.citeCode).toBe('MIN/DTI/INFORME/N°-0006/2026');
        expect(result.sequenceNumber).toBe(6);
    });

    it('debe usar regla por defecto si no existe una configurada', async () => {
        vi.mocked(repository.findByParams).mockResolvedValue(null);
        vi.mocked(repository.upsert).mockResolvedValue({
            id: 'cfg-default',
            organizationId: 'org-1',
            areaId: null,
            documentType: null,
            formatPattern: '{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO:4}/{AÑO}',
            currentSequence: 0,
            year: 2026,
            resetYearly: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        vi.mocked(repository.incrementSequence).mockResolvedValue(1);

        const result = await useCase.execute({
            organizationId: 'org-1',
            areaCode: 'UE',
            orgCode: 'AEV',
            year: 2026,
        });

        expect(result.citeCode).toBe('AEV/UE/DOC/N°-0001/2026');
        expect(result.sequenceNumber).toBe(1);
    });
});
