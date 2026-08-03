import type { ExpedienteDetail } from '../core/expediente.repository';

export interface GetExpedienteDetailsInput {
    id: string;
    organizationId: string;
}

export interface IGetExpedienteDetailsUseCase {
    execute(input: GetExpedienteDetailsInput): Promise<ExpedienteDetail | null>;
}
