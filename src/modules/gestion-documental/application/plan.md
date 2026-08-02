# Plan Técnico: 009 - Paginar Historial de un Documento

## 1. Objetivo

Implementar paginación tipo "Cargar más" (Load More) en la sección de historial de la página de detalle del documento (`/documents/[documentId]`), mostrando un número predefinido de eventos inicialmente y permitiendo cargar más a demanda. Esto mejorará el rendimiento y la experiencia de usuario para documentos con historiales extensos.

## 2. Arquitectura y Estrategia

La estrategia combinará Server Components para la carga inicial y la seguridad, con Client Components y Server Actions para la gestión interactiva de la paginación.

1.  **Carga Inicial con Server Components (`page.tsx`)**:
    *   La página de detalle (`page.tsx`), como Server Component, será responsable de la carga inicial de los detalles del documento y del primer bloque de eventos del historial.
    *   Utilizará `Promise.all` para obtener ambos conjuntos de datos en paralelo, asegurando eficiencia.
    *   La sesión del usuario (incluyendo `userId`, `userRole`, `organizationId`) se obtendrá en el servidor para asegurar el contexto de seguridad y se pasará a los casos de uso correspondientes.

2.  **Paginación Interactiva con Client Component (`DocumentHistorySection.tsx`)**:
    *   Se introducirá un nuevo Client Component, `DocumentHistorySection.tsx`, que encapsulará la lógica de estado y UI para la paginación del historial.
    *   Este componente gestionará el historial acumulado, el `offset` actual, el indicador `hasMore`, y los estados de carga y error.

3.  **Llamadas Subsiguientes con Server Actions (`_actions.ts`)**:
    *   Las solicitudes para "Cargar más" desde el `DocumentHistorySection` se realizarán a través de una Server Action (`getPaginatedDocumentHistory`).
    *   Esto permite mantener la lógica de negocio y la seguridad en el servidor, evitando exponer los casos de uso directamente al cliente.

4.  **Backend (Caso de Uso y Repositorio)**:
    *   El `GetDocumentHistoryUseCase` y el `DrizzleDocumentHistoryRepository` se adaptarán para aceptar los parámetros de paginación (`limit`, `offset`) y los de seguridad (`organizationId`, `userId`, `userRole`).
    *   El repositorio devolverá un objeto `PaginatedHistory` que incluirá la lista de eventos y un flag `hasMore`.

5.  **Seguridad y Multi-tenancy Reforzada**:
    *   La Server Action `getPaginatedDocumentHistory` obtendrá el `organizationId`, `userId` y `userRole` directamente de la sesión de NextAuth.js.
    *   Se validará el formato UUID del `organizationId` y la presencia de `userId` y `userRole`.
    *   El `GetDocumentHistoryUseCase` aplicará la autorización basada en roles (`AUTHORIZED_ROLES`).
    *   El `DrizzleDocumentHistoryRepository` aplicará el filtro `organizationId` en la consulta de la base de datos mediante un `INNER JOIN` a la tabla `documents`.

6.  **Optimización de Base de Datos**:
    *   Se asegurará la existencia de índices adecuados en las tablas `document_history` y `documents` para optimizar las consultas de filtro, unión y ordenación.

## 3. Data Layer

-   **`IDocumentHistoryRepository` (`src/modules/gestion-documental/core/document-history.repository.ts`)**:
    -   La interfaz `IDocumentHistoryRepository` se actualizará para incluir `organizationId` en la firma del método `findByDocumentId`.
    -   Firma: `findByDocumentId(documentId: string, organizationId: string, limit: number, offset: number): Promise<PaginatedHistory>`.
    -   Se definirá el tipo `PaginatedHistory = { history: HistoryEntry[]; hasMore: boolean; }`.

-   **`DrizzleDocumentHistoryRepository` (`src/modules/gestion-documental/infra/drizzle-document-history.repository.ts`)**:
    -   Implementará la firma actualizada de `findByDocumentId`.
    -   El método `findByDocumentId` construirá una consulta Drizzle que:
        -   `INNER JOIN` con `schema.documents` para filtrar por `schema.documents.organizationId`.
        -   `WHERE` clause con `and(eq(schema.documentHistory.documentId, documentId), eq(schema.documents.organizationId, organizationId))`.
        -   `ORDER BY desc(schema.documentHistory.createdAt)`.
        -   `LIMIT(limit + 1)` para obtener un registro extra y determinar `hasMore`.
        -   `OFFSET(offset)`.
    -   Mapeará los resultados a `HistoryEntry[]` y devolverá `PaginatedHistory`.

## 4. Application Layer

-   **`GetDocumentHistoryUseCase` (`src/modules/gestion-documental/application/get-document-history.use-case.ts`)**:
    -   La solicitud (`GetDocumentHistoryUseCaseRequest`) aceptará `documentId`, `organizationId`, `limit`, `offset`, `userId`, `userRole`.
    -   **Autorización por Roles**: Implementará una verificación de roles (`AUTHORIZED_ROLES = ['OPERADOR', 'ADMINISTRADOR']`). Si el `userRole` no está autorizado, lanzará un error `Forbidden`.
    -   **Validación de Parámetros**: Validará que `limit > 0` y `offset >= 0`.
    -   Llamará a `documentHistoryRepository.findByDocumentId` con todos los parámetros relevantes.
    -   Devolverá `PaginatedHistory`.

-   **`GetDocumentDetailsUseCase` (`src/modules/gestion-documental/application/get-document-details.use-case.ts`)**:
    -   Se actualizará para aceptar `organizationId`, `userId` y `userRole` en su `execute` method.
    -   **Autorización por Roles**: Implementará una verificación de roles (`AUTHORIZED_ROLES = ['OPERADOR', 'ADMINISTRADOR']`). Si el `userRole` no está autorizado, lanzará un error `Forbidden`.
    -   Pasará `organizationId` al `documentRepository.findDetailsById`.

## 5. Presentation Layer (UI)

-   **Página de Detalle (`src/app/documents/[documentId]/page.tsx`)**:
    -   Obtendrá la sesión del usuario (`session`) usando `auth()`.
    -   Validará la presencia de `session.user.id`, `session.user.role` y `session.user.organizationId`. Si falta alguno, lanzará un error `Unauthorized`.
    -   Extraerá `userId`, `userRole` y `organizationId` de la sesión.
    -   Llamará a `GetDocumentDetailsUseCase` y a la Server Action `getPaginatedDocumentHistory` para la carga inicial del historial, usando `INITIAL_HISTORY_LIMIT` (ej. 10) y `offset = 0`, pasando los datos de seguridad (`organizationId`, `userId`, `userRole`) a ambos.
    -   Pasará `documentId`, `initialHistory` y `initialHasMore` al nuevo Client Component `DocumentHistorySection`.

-   **Server Action (`src/app/documents/[documentId]/_actions.ts`)**:
    -   La Server Action `getPaginatedDocumentHistory(documentId: string, limit: number, offset: number)`:
        -   Obtendrá el `organizationId`, `userId` y `userRole` de la sesión de NextAuth.js.
        -   Validará el formato UUID de `organizationId` y la presencia de `userId` y `userRole`.
        -   Invocar al `GetDocumentHistoryUseCase` con todos los parámetros de seguridad y paginación.
    -   La función `getCurrentOrganizationId` se actualizará para obtener el `organizationId` de la sesión de NextAuth.js, validar su formato UUID y lanzar errores si no está presente o es inválido.

-   **Componente `DocumentHistorySection.tsx` (Client Component)**:
    -   Será un nuevo componente (`'use client'`).
    -   Recibirá `documentId`, `initialHistory`, `initialHasMore` como props.
    -   Gestionará el estado local para `history` (acumulado), `offset`, `hasMore`, `isLoadingMore`, `loadMoreError`.
    -   Implementará una función `onLoadMore` que:
        -   Llamará a la Server Action `getPaginatedDocumentHistory` con el `documentId`, `DEFAULT_LIMIT` (ej. 10) y el `offset` actual.
        -   Actualizará el estado del historial, `offset` y `hasMore` con los nuevos datos.
        -   Manejará los estados de carga (`isLoadingMore`) y error (`loadMoreError`).
    -   Utilizará un `useEffect` para resetear el estado si `documentId` cambia.
    -   Renderizará el `DocumentHistoryTimeline` pasándole las props adecuadas.

-   **Componente `DocumentHistoryTimeline.tsx` (Client Component)**:
    -   Se modificará para aceptar las props `hasMore`, `onLoadMore`, `isLoadingMore`, `loadMoreError`.
    -   Renderizará el botón "Cargar más" condicionalmente (`hasMore`), mostrando un spinner y deshabilitándose durante la carga (`isLoadingMore`).
    -   Mostrará mensajes de error (`loadMoreError`) si la carga falla.
    -   Se asegurará de usar `<ul>` y `<li>` con `aria-live="polite"` para mejorar la accesibilidad.

## 6. Optimización de Base de Datos

-   **Tabla `document_history`**:
    -   **Índice Compuesto**: `CREATE INDEX idx_document_history_document_id_created_at ON document_history (document_id, created_at DESC);` (para filtro y ordenación).
    -   **Índices en FKs**: Asegurar índices en `from_area_id`, `to_area_id`, `user_id` (si no son ya parte de claves foráneas o índices existentes).
-   **Tabla `documents`**:
    -   **Índice**: `CREATE INDEX idx_documents_organization_id ON documents (organization_id);` (para el filtro multi-tenant).

## 7. Tareas de Implementación

-   **Backend**:
    -   [ ] Actualizar `IDocumentHistoryRepository` con `organizationId`, `limit`, `offset` y `PaginatedHistory`.
    -   [ ] Actualizar `DrizzleDocumentHistoryRepository` para implementar la paginación, el filtro multi-tenant y devolver `PaginatedHistory`.
    -   [ ] Actualizar `GetDocumentHistoryUseCase` para aceptar `organizationId`, `userId`, `userRole`, `limit`, `offset`, implementar autorización por roles y validar parámetros.
    -   [ ] Actualizar `IDocumentRepository` y `DrizzleDocumentRepository` para que `findById` acepte `organizationId` y filtre por él.
    -   [ ] Actualizar `GetDocumentDetailsUseCase` para aceptar `organizationId`, `userId`, `userRole`, implementar autorización por roles y pasar `organizationId` al repositorio.
    -   [ ] Crear la Server Action `getPaginatedDocumentHistory` en `src/app/documents/[documentId]/_actions.ts`, incluyendo la obtención de sesión, validación de `organizationId` (UUID) y roles, y la invocación al caso de uso.

-   **Frontend**:
    -   [ ] Crear el componente `DocumentHistorySection.tsx` (Client Component) para gestionar el estado de la paginación.
    -   [ ] Modificar `DocumentHistoryTimeline.tsx` para aceptar las props de paginación (`hasMore`, `onLoadMore`, `isLoadingMore`, `loadMoreError`) y renderizar el botón "Cargar más" y mensajes de error.
    -   [ ] Modificar la página de detalle (`src/app/documents/[documentId]/page.tsx`) para obtener la sesión, pasar los datos de seguridad al `GetDocumentDetailsUseCase` y pasar el historial inicial al `DocumentHistorySection`.

-   **Optimización de Base de Datos**:
    -   [ ] Añadir Índice Compuesto a `document_history`: `CREATE INDEX idx_document_history_document_id_created_at ON document_history (document_id, created_at DESC);`
    -   [ ] Asegurar Índices en FKs de `document_history`: Verificar/añadir índices en `from_area_id`, `to_area_id`, `user_id` si no existen.
    -   [ ] Añadir Índice a `documents.organization_id`: `CREATE INDEX idx_documents_organization_id ON documents (organization_id);`

-   **Tests**:
    -   [ ] Añadir pruebas de integración para `GetDocumentDetailsUseCase` que verifiquen la autorización por roles y el aislamiento multi-tenant.
    -   [ ] Actualizar pruebas de integración para la Server Action `getPaginatedDocumentHistory` para verificar paginación, `hasMore`, multi-tenancy, autorización por roles y manejo de errores.
    -   [ ] Añadir pruebas de componente para `DocumentHistorySection.tsx` para verificar renderizado inicial, clic en "Cargar más", estados de carga/error, y reinicio de estado.

## 8. Verificación Final

-   [ ] `pnpm typecheck` pasa sin errores.
-   [ ] `pnpm exec vitest run` pasa con todos los tests ejecutados.
-   [ ] `pnpm build` se completa limpiamente.
-   [ ] **Prueba E2E Manual**: Navegar a la página de detalle de un documento con historial extenso, verificar la carga inicial, hacer clic en "Cargar más" varias veces, y verificar el comportamiento con un documento sin historial.
-   [ ] **Verificación de Seguridad**: Intentar acceder al historial de un documento de otra organización (simulando un ataque) y verificar que se deniega el acceso.
-   [ ] **Verificación de Roles**: Probar con usuarios de diferentes roles (autorizados y no autorizados) y verificar el comportamiento esperado.