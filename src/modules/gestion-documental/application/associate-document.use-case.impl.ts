import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IExpedienteRepository } from '../core/expediente.repository';
import type { AssociateDocumentInput, IAssociateDocumentUseCase } from './associate-document.use-case';

@injectable()
export class AssociateDocumentUseCase implements IAssociateDocumentUseCase {
    constructor(
        @inject(InjectionTokens.ExpedienteRepository)
        private readonly expedienteRepository: IExpedienteRepository
    ) {}

    async execute(input: AssociateDocumentInput): Promise<void> {
        const expediente = await this.expedienteRepository.findById({
            id: input.expedienteId,
            organizationId: input.organizationId,
        });

        if (!expediente) {
            throw new Error('Expediente no encontrado.');
        }

        return this.expedienteRepository.associateDocument(input);
    }
}
