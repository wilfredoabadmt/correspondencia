import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IExpedienteRepository, ExpedienteDetail } from '../core/expediente.repository';
import type { GetExpedienteDetailsInput, IGetExpedienteDetailsUseCase } from './get-expediente-details.use-case';

@injectable()
export class GetExpedienteDetailsUseCase implements IGetExpedienteDetailsUseCase {
    constructor(
        @inject(InjectionTokens.ExpedienteRepository)
        private readonly expedienteRepository: IExpedienteRepository
    ) {}

    async execute(input: GetExpedienteDetailsInput): Promise<ExpedienteDetail | null> {
        return this.expedienteRepository.findById(input);
    }
}
