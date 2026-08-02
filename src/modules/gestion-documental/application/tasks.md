# Tareas: 009 - Paginar Historial de un Documento

## 1. Backend

- [x] **Actualizar Interfaz del Repositorio**: Actualizar `IDocumentHistoryRepository` con `organizationId`, `limit`, `offset` y `PaginatedHistory`.
- [x] **Implementar Repositorio**: Actualizar `DrizzleDocumentHistoryRepository` para implementar la paginación, el filtro multi-tenant y devolver `PaginatedHistory`.
- [x] **Actualizar Caso de Uso**: Actualizar `GetDocumentHistoryUseCase` para aceptar `organizationId`, `userId`, `userRole`, `limit`, `offset`, implementar autorización por roles y validar parámetros.
- [x] **Crear Server Action**: Crear la Server Action `getPaginatedDocumentHistory` en `src/app/documents/[documentId]/_actions.ts`, incluyendo la obtención de sesión, validación de `organizationId` (UUID) y roles, y la invocación al caso de uso.

## 2. Frontend

- [x] **Crear Componente de Sección de Historial**: Crear el componente `DocumentHistorySection.tsx` (Client Component) para gestionar el estado de la paginación.
- [x] **Modificar Componente de Línea de Tiempo**: Modificar `DocumentHistoryTimeline.tsx` para aceptar las props de paginación (`hasMore`, `onLoadMore`, `isLoadingMore`, `loadMoreError`) y renderizar el botón "Cargar más" y mensajes de error.
- [x] **Integrar en Página de Detalle**: Modificar la página de detalle (`src/app/documents/[documentId]/page.tsx`) para obtener la sesión, pasar los datos de seguridad al `GetDocumentDetailsUseCase` y pasar el historial inicial al `DocumentHistorySection`.

## 3. Optimización de Base de Datos

- [ ] **Añadir Índice Compuesto a `document_history`**: `CREATE INDEX idx_document_history_document_id_created_at ON document_history (document_id, created_at DESC);`
- [ ] **Asegurar Índices en FKs de `document_history`**: Verificar/añadir índices en `from_area_id`, `to_area_id`, `user_id` si no existen.
- [ ] **Añadir Índice a `documents.organization_id`**: `CREATE INDEX idx_documents_organization_id ON documents (organization_id);`

## 4. Pruebas (Tests)

- [x] **Pruebas de Integración para `GetDocumentDetailsUseCase`**: Añadir pruebas que verifiquen la autorización por roles y el aislamiento multi-tenant.
- [x] **Pruebas de Integración para Server Action**: Actualizar pruebas de integración para la Server Action `getPaginatedDocumentHistory` para verificar paginación, `hasMore`, multi-tenancy, autorización por roles y manejo de errores.
- [x] **Pruebas de Componente para `DocumentHistorySection.tsx`**: Añadir pruebas para verificar renderizado inicial, clic en "Cargar más", estados de carga/error, y reinicio de estado.

## 5. Verificación Final

- [ ] `pnpm typecheck` pasa sin errores.
- [ ] `pnpm exec vitest run` pasa con todos los tests ejecutados.
- [ ] `pnpm build` se completa limpiamente.
- [ ] **Prueba E2E Manual**: Navegar a la página de detalle de un documento con historial extenso, verificar la carga inicial, hacer clic en "Cargar más" varias veces, y verificar el comportamiento con un documento sin historial.
- [ ] **Verificación de Seguridad**: Intentar acceder al historial de un documento de otra organización (simulando un ataque) y verificar que se deniega el acceso.
- [ ] **Verificación de Roles**: Probar con usuarios de diferentes roles (autorizados y no autorizados) y verificar el comportamiento esperado.