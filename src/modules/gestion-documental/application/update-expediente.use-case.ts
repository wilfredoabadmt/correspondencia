import type { Expediente } from '../core/expediente.entity';

export interface UpdateExpedienteInput {
    id: string;
    organizationId: string;
    subject?: string;
    status?: string;
}

export interface IUpdateExpedienteUseCase {
    execute(input: UpdateExpedienteInput): Promise<Expediente>;
}
