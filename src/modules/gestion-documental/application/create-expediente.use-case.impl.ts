import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { Expediente } from '../core/expediente.entity';
import type { IExpedienteRepository } from '../core/expediente.repository';
import type { CreateExpedienteInput, ICreateExpedienteUseCase } from './create-expediente.use-case';

@injectable()
export class CreateExpedienteUseCase implements ICreateExpedienteUseCase {
    constructor(
        @inject(InjectionTokens.ExpedienteRepository)
        private readonly expedienteRepository: IExpedienteRepository
    ) {}

    async execute(input: CreateExpedienteInput): Promise<Expediente> {
        const existing = await this.expedienteRepository.findByCode({
            code: input.code,
            organizationId: input.organizationId,
        });

        if (existing) {
            throw new Error(`Ya existe un expediente con el código "${input.code}" en esta organización.`);
        }

        return this.expedienteRepository.create(input);
    }
}
