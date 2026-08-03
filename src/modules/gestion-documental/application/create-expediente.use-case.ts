import type { Expediente } from '../core/expediente.entity';

export interface CreateExpedienteInput {
    code: string;
    subject: string;
    organizationId: string;
}

export interface ICreateExpedienteUseCase {
    execute(input: CreateExpedienteInput): Promise<Expediente>;
}
