import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IProveidoCatalogRepository, Proveido } from '../core/proveido-catalog.repository';

@injectable()
export class ListProveidosUseCase {
    constructor(
        @inject(InjectionTokens.ProveidoCatalogRepository)
        private readonly proveidoCatalogRepository: IProveidoCatalogRepository
    ) { }

    async execute(organizationId: string): Promise<Proveido[]> {
        return await this.proveidoCatalogRepository.listByOrganization(organizationId);
    }
}
