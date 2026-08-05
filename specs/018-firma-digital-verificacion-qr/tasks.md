# Lista de Tareas: Feature 018 - Firma Digital y Verificación QR

## Fase 1: Base de Datos y Backend

- [x] **Tarea 1.1: Actualizar Esquema Drizzle y Generar Migración**
    - [x] Añadir campos `isSigned`, `signedAt`, `signedByUserId`, `signatureHash` y `verificationCode` en `documents` (`db/schema.ts`).
    - [x] Generar migración con `pnpm db:generate` (`db/migrations/0003_tiresome_stingray.sql`).

- [x] **Tarea 1.2: Casos de Uso del Backend**
    - [x] Implementar `SignDocumentUseCase` (generación de hash SHA-256 y código único de verificación).
    - [x] Implementar `VerifyDocumentUseCase` (consulta pública aislada de metadatos de firma).
    - [x] Registrar nuevos tokens y servicios en `src/core/injection-tokens.ts` y `src/core/container.ts`.

- [x] **Tarea 1.3: Endpoints de API**
    - [x] Endpoint de firma: `POST /api/documents/[documentId]/sign`.
    - [x] Endpoint de consulta pública: `GET /api/public/verify/[code]`.

## Fase 2: Impresión de PDF con QR y Frontend

- [x] **Tarea 2.1: Integración de Código QR en Hoja de Ruta PDF**
    - [x] Integrar librería de generación de QR (`qrcode`).
    - [x] Actualizar el generador de PDF `generate-routing-slip-pdf.use-case.ts` y `pdf-generator.service.ts` para renderizar la imagen QR y el pie de verificación.

- [x] **Tarea 2.2: Interfaz de Usuario Interna y Portal Público**
    - [x] Crear componente `DigitalSignatureBadge` y modal `SignDocumentModal`.
    - [x] Actualizar `DocumentDetailsCard` con botón para firmar y badge de verificación.
    - [x] Crear la página de verificación pública en `/verificar/[code]`.

## Fase 3: Quality Gate y Pruebas

- [x] **Tarea 3.1: Pruebas Unitarias e Integración**
    - [x] Pruebas unitarias para `SignDocumentUseCase` y `VerifyDocumentUseCase` (27/27 archivos, 52/52 pruebas pasadas).
- [x] **Tarea 3.2: Quality Gate**
    - [x] `pnpm typecheck` — 0 errores.
    - [x] `pnpm test` — 52/52 pruebas en verde.
    - [x] `pnpm build` — Compilación de producción exitosa.
