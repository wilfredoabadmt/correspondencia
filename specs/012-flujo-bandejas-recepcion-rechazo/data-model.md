# Modelo de Datos: Feature 012 - Flujo Completo de Bandejas

## 1. Extensiones en la Tabla `documents` (`db/schema.ts`)

```typescript
export const documents = pgTable('documents', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    trackingId: text('tracking_id'),
    trackingCode: text('tracking_code'),
    subject: text('subject'),
    sender: text('sender'),
    status: text('status'), // 'PENDIENTE_RECEPCION', 'RECIBIDO', 'RECHAZADO', 'ARCHIVADO'
    organizationId: text('organization_id'),
    receptionDate: timestamp('reception_date'),
    documentType: text('document_type'),
    destinationAreaId: text('destination_area_id'),
    areaHierarchyId: text('area_hierarchy_id'),
    currentUserId: text('current_user_id'), // Usuario actualmente responsable del trámite
    groupedIntoDocumentId: text('grouped_into_document_id'), // ID del documento principal si está agrupado
    folderCategory: text('folder_category'), // Carpeta de archivo (ej. GESTION-2026)
    archiveObservations: text('archive_observations'),
    fileKey: text('file_key'),
    downloadUrl: text('download_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## 2. Extensiones en la Tabla `document_history` (`db/schema.ts`)

```typescript
export const documentHistory = pgTable('document_history', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    documentId: text('document_id').notNull(),
    fromAreaId: text('from_area_id'),
    toAreaId: text('to_area_id').notNull(),
    fromUserId: text('from_user_id'),
    toUserId: text('to_user_id'),
    userId: text('user_id').notNull(), // Actor de la acción
    action: text('action').notNull(), // 'DERIVAR', 'RECIBIR', 'RECHAZAR', 'CANCELAR_DERIVACION', 'JUSTIFICAR', 'AGRUPAR', 'ARCHIVAR', 'DESARCHIVAR'
    receptionStatus: text('reception_status'), // 'PENDIENTE_RECEPCION', 'RECIBIDO', 'RECHAZADO', 'CANCELADO'
    receivedAt: timestamp('received_at'),
    rejectionReason: text('rejection_reason'),
    justificationReason: text('justification_reason'),
    comment: text('comment'),
    derivationType: text('derivation_type'), // 'OFICIAL', 'COPIA'
    instructionCode: text('instruction_code'), // 'PARA_SU_ATENCION', 'ELABORAR_INFORME', 'CONOCIMIENTO', 'URGENTE'
    isUrgent: boolean('is_urgent').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 3. Matriz de Transiciones de Estado (`status`)

| Estado Inicial | Acción / Evento | Estado Final | Permisos / Condición |
| :--- | :--- | :--- | :--- |
| `REGISTRADO` | Derivar Documento | `PENDIENTE_RECEPCION` | Remitente con custodia |
| `PENDIENTE_RECEPCION` | Recibir Documento | `RECIBIDO` | Solo Destinatario asignado |
| `PENDIENTE_RECEPCION` | Rechazar Documento | `RECHAZADO` | Solo Destinatario asignado + Justificación |
| `PENDIENTE_RECEPCION` | Cancelar Derivación | `RECIBIDO` (en Remitente) | Solo Remitente antes de recepción |
| `RECIBIDO` | Archivar Documento | `ARCHIVADO` | Usuario en custodia + Carpeta de archivo |
| `ARCHIVADO` | Desarchivar Documento | `RECIBIDO` | Usuario de la misma área/org |
