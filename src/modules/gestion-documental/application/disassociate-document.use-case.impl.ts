import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IExpedienteRepository } from '../core/expediente.repository';
import type { DisassociateDocumentInput, IDisassociateDocumentUseCase } from './disassociate-document.use-case';

@injectable()
export class DisassociateDocumentUseCase implements IDisassociateDocumentUseCase {
    constructor(
        @inject(InjectionTokens.ExpedienteRepository)
        private readonly expedienteRepository: IExpedienteRepository
    ) {}

    async execute(input: DisassociateDocumentInput): Promise<void> {
        return this.expedienteRepository.disassociateDocument(input);
    }
}
