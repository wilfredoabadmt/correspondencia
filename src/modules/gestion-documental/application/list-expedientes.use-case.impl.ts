import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { ExpedienteWithDocumentCount } from '../core/expediente.entity';
import type { IExpedienteRepository, PaginatedResult } from '../core/expediente.repository';
import type { IListExpedientesUseCase, ListExpedientesInput } from './list-expedientes.use-case';

@injectable()
export class ListExpedientesUseCase implements IListExpedientesUseCase {
    constructor(
        @inject(InjectionTokens.ExpedienteRepository)
        private readonly expedienteRepository: IExpedienteRepository
    ) {}

    async execute(input: ListExpedientesInput): Promise<PaginatedResult<ExpedienteWithDocumentCount>> {
        return this.expedienteRepository.findMany(input);
    }
}
