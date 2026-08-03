export interface AssociateDocumentInput {
    documentId: string;
    expedienteId: string;
    organizationId: string;
}

export interface IAssociateDocumentUseCase {
    execute(input: AssociateDocumentInput): Promise<void>;
}
