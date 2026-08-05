# Lista de Tareas: Feature 020 - Ventanilla Única y Seguimiento Público para Ciudadanos

## Fase 1: Base de Datos y Backend

- [x] **Tarea 1.1: Actualizar Esquema Drizzle y Migración**
    - [x] Añadir campos `isExternal`, `applicantIdentityDocument`, `applicantName`, `applicantInstitution`, `applicantPhone` y `applicantEmail` en `documents` (`db/schema.ts`).
    - [x] Generar migración con `pnpm db:generate` (`db/migrations/0005_thin_valeria_richards.sql`).

- [x] **Tarea 1.2: Casos de Uso del Backend**
    - [x] Implementar `GetPublicTrackingInfoUseCase` (retorna timeline e información sanitaria no confidencial).
    - [x] Implementar `RegisterExternalDocumentUseCase` (asocia datos del remitente externo y genera CITE).
    - [x] Implementar `GenerateReceiptPdfUseCase` (recibo oficial en PDF con QR).
    - [x] Registrar tokens en `injection-tokens.ts` y container `container.ts`.

- [x] **Tarea 1.3: Endpoints de API**
    - [x] Endpoint de seguimiento público: `GET /api/public/tracking/[code]`.
    - [x] Endpoint para descargar comprobante PDF de recibo: `GET /api/documents/[documentId]/receipt`.
    - [x] Endpoint de registro externo: `POST /api/documents/external`.

## Fase 2: Frontend (Ventanilla Única y Portal Público)

- [x] **Tarea 2.1: Portal Público de Seguimiento**
    - [x] Crear la página pública `/seguimiento/page.tsx` con buscador interactivo `PublicTrackingSearch` y línea del tiempo.

- [x] **Tarea 2.2: Interfaz de Ventanilla Única**
    - [x] Crear la página `/ventanilla/page.tsx` para operadores de recepción con formulario extendido `VentanillaRegistrationForm` y botón de impresión de comprobante.

## Fase 3: Quality Gate y Pruebas

- [x] **Tarea 3.1: Pruebas Unitarias**
    - [x] Pruebas unitarias para `GetPublicTrackingInfoUseCase` (29/29 archivos, 56/56 pruebas pasadas).
- [x] **Tarea 3.2: Quality Gate**
    - [x] `pnpm typecheck` — 0 errores.
    - [x] `pnpm test` — 56/56 pruebas en verde.
    - [x] `pnpm build` — Compilación de producción exitosa.
