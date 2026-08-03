import type { Expediente, ExpedienteWithDocumentCount } from './expediente.entity';

export type PaginatedResult<T> = {
    data: T[];
    total: number;
};

export type FindManyExpedientesParams = {
    organizationId: string;
    page: number;
    pageSize: number;
    query?: string;
    status?: string;
};

export type CreateExpedienteParams = {
    code: string;
    subject: string;
    organizationId: string;
};

export type UpdateExpedienteParams = {
    id: string;
    organizationId: string;
    subject?: string;
    status?: string;
};

export type ExpedienteDetail = Expediente & {
    documents: { id: string; subject: string | null; trackingCode: string | null; status: string | null; createdAt: Date | null }[];
};

export interface IExpedienteRepository {
    create(params: CreateExpedienteParams): Promise<Expediente>;

    findMany(params: FindManyExpedientesParams): Promise<PaginatedResult<ExpedienteWithDocumentCount>>;

    findById(params: { id: string; organizationId: string }): Promise<ExpedienteDetail | null>;

    findByCode(params: { code: string; organizationId: string }): Promise<Expediente | null>;

    update(params: UpdateExpedienteParams): Promise<Expediente>;

    associateDocument(params: { documentId: string; expedienteId: string; organizationId: string }): Promise<void>;

    disassociateDocument(params: { documentId: string; organizationId: string }): Promise<void>;

    searchForAssociation(params: { organizationId: string; query: string }): Promise<Expediente[]>;
}
