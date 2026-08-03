# Plan Técnico: Feature 017 - Gestión de Expedientes Virtuales

## 1. Estrategia General

La implementación se centrará en crear un nuevo módulo de dominio llamado `expedientes`. Seguiremos la arquitectura de "modular monolith" del proyecto.

1.  **Modelo de Datos**: Se extenderá el esquema de la base de datos en `db/schema.ts` para añadir la tabla `expedientes` y conectar los documentos existentes a ella.
2.  **Capa de Backend**: Se desarrollarán nuevos endpoints en la API para gestionar el ciclo de vida de los expedientes y sus documentos asociados.
3.  **Capa de Frontend**: Se crearán nuevos componentes y páginas en React/Next.js para que los usuarios puedan interactuar con los expedientes.
4.  **Seguridad**: Se reutilizará el sistema de autenticación y autorización existente para proteger el acceso al nuevo módulo.

---

## 2. Modelo de Datos (Drizzle ORM)

Los cambios se realizarán en `db/schema.ts`.

### 2.1. Nueva Tabla: `expedientes`

Se añadirá una nueva tabla para almacenar la información de los expedientes.

```typescript
export const expedientes = pgTable('expedientes', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    code: text('code').notNull(), // Ej. EXP-2026-0001
    subject: text('subject').notNull(),
    status: text('status').default('Abierto').notNull(), // Posibles valores: 'Abierto', 'Cerrado', 'Archivado'
    organizationId: text('organization_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        organizationIdIdx: index('idx_expedientes_organization_id').on(table.organizationId),
        codeOrgIdUniqueIdx: uniqueIndex('idx_expedientes_code_org_id').on(table.code, table.organizationId),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
    };
});
```

### 2.2. Modificación a la Tabla `documents`

Se añadirá una columna `expedienteId` a la tabla `documents` para crear la relación.

```typescript
// En la tabla 'documents'
export const documents = pgTable('documents', {
    // ... campos existentes
    id: text('id').primaryKey().$defaultFn(() => createId()),
    // ...
    expedienteId: text('expediente_id'), // NUEVO CAMPO
    // ...
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        // ... índices y FKs existentes
        expedienteIdIdx: index('idx_documents_expediente_id').on(table.expedienteId), // NUEVO ÍNDICE
        expedienteFk: foreignKey({ // NUEVA FK
            columns: [table.expedienteId],
            foreignColumns: [expedientes.id],
        }).onDelete('set null'), // Si se borra un expediente, los documentos no se borran, solo se desvinculan.
    };
});
```
**Nota:** Este nuevo campo `expedienteId` formaliza la agrupación y deberá reemplazar el uso del campo `groupedIntoDocumentId` existente para esta funcionalidad.

---

## 3. Capa de Backend (API Endpoints)

Se creará una nueva ruta de API en `src/app/api/expedientes/`. Todas las rutas deben estar protegidas y validar el `organizationId` del usuario.

-   **`POST /api/expedientes`**:
    -   **Acción**: Crear un nuevo expediente.
    -   **Body**: `{ subject: string }`
    -   **Respuesta**: `{ id: string, code: string, ... }`

-   **`GET /api/expedientes`**:
    -   **Acción**: Listar todos los expedientes de la organización del usuario, con paginación.
    -   **Respuesta**: `[{ id, code, subject, status, createdAt, documentCount }]`

-   **`GET /api/expedientes/[id]`**:
    -   **Acción**: Obtener los detalles de un expediente, incluyendo la lista de documentos asociados.
    -   **Respuesta**: `{ id, code, subject, status, documents: [...] }`

-   **`PUT /api/expedientes/[id]`**:
    -   **Acción**: Actualizar el asunto o estado de un expediente.
    -   **Body**: `{ subject?: string, status?: string }`
    -   **Respuesta**: `{ id, subject, status, ... }`

-   **`PUT /api/documents/[documentId]/associate`**:
    -   **Acción**: Asociar un documento a un expediente.
    -   **Body**: `{ expedienteId: string }`
    -   **Respuesta**: `{ success: true }`

-   **`PUT /api/documents/[documentId]/disassociate`**:
    -   **Acción**: Desvincular un documento de su expediente.
    -   **Body**: `{}`
    -   **Respuesta**: `{ success: true }`

---

## 4. Capa de Frontend (UI)

Se creará un nuevo módulo en `src/modules/expedientes` que contendrá los componentes y lógica de la UI.

1.  **Navegación**: Añadir un enlace "Expedientes" en el layout principal (`src/components/layout/...`).

2.  **Página de Listado**:
    -   **Ruta**: `/dashboard/expedientes`
    -   **Componentes**:
        -   Tabla para mostrar los expedientes (`ExpedientesDataTable`).
        -   Botón "Crear Expediente" que abrirá un modal (`CrearExpedienteModal`).

3.  **Página de Detalle**:
    -   **Ruta**: `/dashboard/expedientes/[id]`
    -   **Componentes**:
        -   Cabecera con la información del expediente y acciones (ej. "Cambiar Estado").
        -   Tabla con la lista de documentos asociados.

4.  **Componente de Asociación**:
    -   Se creará un `AsociarExpedienteModal` que podrá ser invocado desde las vistas de documentos.
    -   Este modal contendrá un buscador/selector de expedientes para realizar la vinculación.

---

## 5. Próximos Pasos

El siguiente paso es desglosar este plan en tareas concretas en el archivo `tasks.md`, siguiendo el flujo SDD.
