import { Document, DocumentType } from '../core/document.entity';

/**
 * Data Transfer Object (DTO) for registering a new document.
 * This carries the data from the presentation layer to the application layer.
 */
export interface RegisterDocumentInput {
    organizationId: string; // Injected from user's session
    userId: string; // Injected from user's session for auditing

    documentType: DocumentType;
    areaHierarchyId: string;
    subject: string;
    sender: string;
    receptionDate: Date;
    documentNumber?: string;

    // The file itself is handled by a separate upload service.
    // The use case receives the key/path after a successful upload to the S3-compatible storage.
    attachmentStorageKey?: string;
}

/**
 * Defines the contract for the "Register Document" use case.
 */
export interface IRegisterDocumentUseCase {
    /**
     * Executes the use case to register a new document.
     * @param input The data for the new document.
     * @returns A promise that resolves to the newly created document.
     */
    execute(input: RegisterDocumentInput): Promise<Document>;
}