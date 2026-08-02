import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { AreaHierarchy } from '../core/area-hierarchy.entity';
import type { IAreaHierarchyRepository } from '../core/area-hierarchy.repository';
import type { IListAreasUseCase, ListAreasInput } from './list-areas.use-case';

@injectable()
export class ListAreasUseCase implements IListAreasUseCase {
    constructor(
        @inject(InjectionTokens.AreaHierarchyRepository)
        private readonly areaHierarchyRepository: IAreaHierarchyRepository
    ) { }

    async execute(input: ListAreasInput): Promise<AreaHierarchy[]> {
        return this.areaHierarchyRepository.listByOrg(input.organizationId);
    }
}