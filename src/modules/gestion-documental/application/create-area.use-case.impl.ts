import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { AreaHierarchy } from '../core/area-hierarchy.entity';
import type { IAreaHierarchyRepository } from '../core/area-hierarchy.repository';
import type { CreateAreaInput, ICreateAreaUseCase } from './create-area.use-case';

@injectable()
export class CreateAreaUseCase implements ICreateAreaUseCase {
    constructor(
        @inject(InjectionTokens.AreaHierarchyRepository)
        private readonly areaHierarchyRepository: IAreaHierarchyRepository
    ) { }

    async execute(input: CreateAreaInput): Promise<AreaHierarchy> {
        return this.areaHierarchyRepository.create(input);
    }
}