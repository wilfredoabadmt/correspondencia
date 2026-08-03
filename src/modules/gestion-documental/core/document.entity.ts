/**
 * Tipos de documento permitidos en el sistema.
 * Coincide con la regla de negocio de la especificación.
 */
export const DocumentType = {
    INFORME: 'INF',
    NOTA_EXTERNA: 'NE',
    NOTA_INTERNA: 'NI',
    MEMORANDUM: 'MEM',
    INSTRUCTIVO: 'INS',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

/**
 * Estados por los que puede pasar un documento.
 * El estado inicial siempre es 'Recibido'.
 */
export const DocumentStatus = {
    RECIBIDO: 'Recibido',
    PENDIENTE_RECEPCION: 'PENDIENTE_RECEPCION',
    RECHAZADO: 'RECHAZADO',
    CANCELADO: 'CANCELADO',
    ARCHIVADO: 'ARCHIVADO',
} as const;

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

/**
 * Representa la entidad de dominio de un Documento.
 * Contiene los datos y las invariantes de negocio.
 */
export interface Document {
    id: string; // UUID
    organizationId: string; // ID del Tenant

    // Código de trámite generado
    trackingCode: string; // ej: "INF/UE-APROCAM/PRCC-AR/01262-2025"

    // Metadatos principales del documento
    documentType: DocumentType;
    areaHierarchyId: string; // ID de la jerarquía de área seleccionada
    subject: string;
    sender: string; // Remitente (texto libre para el MVP)
    receptionDate: Date;
    documentNumber?: string; // Número de documento de origen (opcional)

    // Estado y flujo
    status: DocumentStatus;

    // Archivo adjunto
    attachmentUrl?: string; // URL al archivo en el storage S3-compatible

    // Timestamps de auditoría
    createdAt: Date;
    updatedAt: Date;
}