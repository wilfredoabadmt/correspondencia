export interface DisassociateDocumentInput {
    documentId: string;
    organizationId: string;
}

export interface IDisassociateDocumentUseCase {
    execute(input: DisassociateDocumentInput): Promise<void>;
}
