import type { ExpedienteWithDocumentCount } from '../core/expediente.entity';
import type { PaginatedResult } from '../core/expediente.repository';

export interface ListExpedientesInput {
    organizationId: string;
    page: number;
    pageSize: number;
    query?: string;
    status?: string;
}

export interface IListExpedientesUseCase {
    execute(input: ListExpedientesInput): Promise<PaginatedResult<ExpedienteWithDocumentCount>>;
}
