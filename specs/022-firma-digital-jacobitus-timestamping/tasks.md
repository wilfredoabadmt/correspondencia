# Lista de Tareas: Feature 022 - Integración con Firma Digital Jacobitus / AGETIC & Sellado de Tiempo (Timestamping)

## Fase 1: Base de Datos y Backend

- [x] **Tarea 1.1: Actualizar Esquema Drizzle y Migración**
    - [x] Añadir campos `signedCertificateSubject`, `signedCertificateIssuer`, `timestampAuthority` y `timestampedAt` en `documents` (`db/schema.ts`).
    - [x] Generar migración con `pnpm db:generate` (`db/migrations/0007_foamy_virginia_dare.sql`).

- [x] **Tarea 1.2: Servicios y Adaptadores Jacobitus / TSA**
    - [x] Crear interfaces `IJacobitusService` y `ITsaTimestampService`.
    - [x] Implementar `JacobitusRestService` y `TsaTimestampService`.
    - [x] Implementar `SignDocumentJacobitusUseCase`.
    - [x] Registrar tokens en `injection-tokens.ts` y container `container.ts`.

- [x] **Tarea 1.3: Endpoints de API**
    - [x] Endpoint `POST /api/documents/[documentId]/sign-jacobitus`.
    - [x] Endpoint `GET /api/documents/[documentId]/certificate-info`.

## Fase 2: Frontend e Integración en UI

- [x] **Tarea 2.1: Componente de Firma Jacobitus FIDO**
    - [x] Crear modal `JacobitusSignModal` para interconexión con servicio Jacobitus local/PIN.
- [x] **Tarea 2.2: Badge de Certificado e Inspector TSA**
    - [x] Incorporar `DigitalCertificateBadge` para inspección de firmas PAdES y sello de tiempo TSA en el visor de documentos.

## Fase 3: Quality Gate y Pruebas

- [x] **Tarea 3.1: Pruebas Unitarias**
    - [x] Pruebas unitarias para `SignDocumentJacobitusUseCase` (31/31 archivos, 58/58 pruebas pasadas).
- [x] **Tarea 3.2: Quality Gate**
    - [x] `pnpm typecheck` — 0 errores.
    - [x] `pnpm test` — 58/58 pruebas en verde.
    - [x] `pnpm build` — Compilación de producción exitosa.
