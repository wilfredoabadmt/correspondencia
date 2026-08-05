# Lista de Tareas: Feature 021 - Proveídos Tipificados y Derivación Multidestino (Original / Copia)

## Fase 1: Base de Datos y Backend

- [x] **Tarea 1.1: Crear Esquema Drizzle y Migración**
    - [x] Definir la tabla `proveido_catalog` en `db/schema.ts`.
    - [x] Verificar campos `derivationType` e `instructionCode` en `document_history`.
    - [x] Generar migración con `pnpm db:generate` (`db/migrations/0006_serious_squadron_supreme.sql`).

- [x] **Tarea 1.2: Repositorios y Casos de Uso**
    - [x] Crear `IProveidoCatalogRepository` e implementación `DrizzleProveidoCatalogRepository` (con auto-seeding de proveídos estándar).
    - [x] Crear `DeriveMultidestinationDocumentUseCase` (derivación atómica a 1 Original + N Copias).
    - [x] Crear `ListProveidosUseCase`.
    - [x] Registrar tokens en `injection-tokens.ts` y container `container.ts`.

- [x] **Tarea 1.3: Endpoints de API**
    - [x] Endpoint `POST /api/documents/[documentId]/derive-multidestination`.
    - [x] Endpoint `GET /api/admin/proveidos`.

## Fase 2: Frontend e Integración en UI

- [x] **Tarea 2.1: Actualizar Formulario de Derivación**
    - [x] Modificar `DeriveDocumentForm` (`src/components/document/derive-document-form.tsx`) para soportar selección de proveídos tipificados e inclusión de áreas en copia informativa.
- [x] **Tarea 2.2: Badges en Bandejas y Vista de Detalle**
    - [x] Indicador de tipo de derivación (Original vs Copia) e instrucciones en formulario y timeline.

## Fase 3: Quality Gate y Pruebas

- [x] **Tarea 3.1: Pruebas Unitarias**
    - [x] Pruebas unitarias para `DeriveMultidestinationDocumentUseCase` (30/30 archivos, 57/57 pruebas pasadas).
- [x] **Tarea 3.2: Quality Gate**
    - [x] `pnpm typecheck` — 0 errores.
    - [x] `pnpm test` — 57/57 pruebas en verde.
    - [x] `pnpm build` — Compilación de producción exitosa.
