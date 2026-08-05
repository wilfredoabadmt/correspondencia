import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { CiteConfig, ICiteConfigRepository, UpsertCiteConfigParams } from '../core/cite-config.repository';

@injectable()
export class ManageCiteConfigsUseCase {
    constructor(
        @inject(InjectionTokens.CiteConfigRepository)
        private readonly citeConfigRepository: ICiteConfigRepository
    ) { }

    async list(organizationId: string): Promise<CiteConfig[]> {
        return await this.citeConfigRepository.listByOrganization(organizationId);
    }

    async save(params: UpsertCiteConfigParams): Promise<CiteConfig> {
        if (!params.formatPattern || params.formatPattern.trim().length === 0) {
            throw new Error('El patrón de CITE es obligatorio.');
        }

        return await this.citeConfigRepository.upsert(params);
    }
}
