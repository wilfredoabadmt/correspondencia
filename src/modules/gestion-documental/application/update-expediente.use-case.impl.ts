import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { Expediente } from '../core/expediente.entity';
import type { IExpedienteRepository } from '../core/expediente.repository';
import type { UpdateExpedienteInput, IUpdateExpedienteUseCase } from './update-expediente.use-case';

@injectable()
export class UpdateExpedienteUseCase implements IUpdateExpedienteUseCase {
    constructor(
        @inject(InjectionTokens.ExpedienteRepository)
        private readonly expedienteRepository: IExpedienteRepository
    ) {}

    async execute(input: UpdateExpedienteInput): Promise<Expediente> {
        const expediente = await this.expedienteRepository.findById({
            id: input.id,
            organizationId: input.organizationId,
        });

        if (!expediente) {
            throw new Error('Expediente no encontrado.');
        }

        return this.expedienteRepository.update(input);
    }
}
