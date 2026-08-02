import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { AreaHierarchy } from '../core/area-hierarchy.entity';
import type { IAreaHierarchyRepository } from '../core/area-hierarchy.repository';
import type { IUpdateAreaUseCase, UpdateAreaInput } from './update-area.use-case';

@injectable()
export class UpdateAreaUseCase implements IUpdateAreaUseCase {
    constructor(
        @inject(InjectionTokens.AreaHierarchyRepository)
        private readonly areaHierarchyRepository: IAreaHierarchyRepository
    ) { }

    async execute(input: UpdateAreaInput): Promise<AreaHierarchy> {
        const updatedArea = await this.areaHierarchyRepository.update(
            input.areaId,
            input.organizationId,
            input.data
        );

        if (!updatedArea) {
            throw new Error(
                `Area with ID "${input.areaId}" not found in this organization.`
            );
        }

        return updatedArea;
    }
}