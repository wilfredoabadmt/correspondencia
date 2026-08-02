import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IAreaHierarchyRepository } from '../core/area-hierarchy.repository';
import type { DeleteAreaInput, IDeleteAreaUseCase } from './delete-area.use-case';

@injectable()
export class DeleteAreaUseCase implements IDeleteAreaUseCase {
    constructor(
        @inject(InjectionTokens.AreaHierarchyRepository)
        private readonly areaHierarchyRepository: IAreaHierarchyRepository
    ) { }

    async execute(input: DeleteAreaInput): Promise<void> {
        await this.areaHierarchyRepository.delete(input.areaId, input.organizationId);
    }
}