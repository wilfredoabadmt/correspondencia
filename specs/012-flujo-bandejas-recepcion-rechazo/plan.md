# Implementation Plan: 012 - Flujo Completo de Bandejas (Recepción, Rechazo, Cancelar Derivación, Agrupar, Justificar y Archivar/Desarchivar)

**Branch**: `012-flujo-bandejas-recepcion-rechazo` | **Date**: 2026-08-02 | **Spec**: [specs/012-flujo-bandejas-recepcion-rechazo/spec.md](file:///d:/Documentos/GitHub/correspondencia/specs/012-flujo-bandejas-recepcion-rechazo/spec.md)

---

## Technical Context

**Language/Version**: TypeScript / Node.js (Next.js 14+ App Router)  
**Primary Dependencies**: Next.js, Drizzle ORM, Better Auth, Tailwind CSS, shadcn/ui, tsyringe (Inversión de Control)  
**Storage**: PostgreSQL (self-hosted / Coolify) + Cloudflare R2 / S3  
**Testing**: Vitest (`pnpm exec vitest run`) + Playwright  
**Target Platform**: Web application (Responsive)  
**Project Type**: Monolito Modular Web Service  
**Performance Goals**: < 200ms tiempo de respuesta en transacciones de estado de bandejas  
**Constraints**: Multi-tenant isolation por `organizationId`, transacciones atómicas PostgreSQL en Drizzle  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Aislamiento Multi-tenant**: Todas las consultas de bandejas filtran estrictamente por `organizationId`.
- [x] **Arquitectura Monolito Modular**: Los nuevos casos de uso se organizan dentro del módulo de dominio `gestion-documental`.
- [x] **Inyección de Dependencias**: Repositorios y casos de uso registrados en `tsyringe` (`container.ts`).
- [x] **Calidad Técnica**: `pnpm typecheck`, `pnpm lint`, `pnpm test` en verde.

---

## Project Structure & Artifacts

```text
specs/012-flujo-bandejas-recepcion-rechazo/
├── spec.md              # Especificación funcional de negocio
├── plan.md              # Plan de implementación técnica (este archivo)
├── research.md          # Investigación de transiciones de estado y agrupación
├── data-model.md        # Definición de modelo Drizzle y transiciones
└── quickstart.md        # Guía de validación E2E manual
```

---

## Proposed Changes

### Component: Data Layer & Repositories (`db/` & `src/modules/gestion-documental/infra/`)

#### [MODIFY] [schema.ts](file:///d:/Documentos/GitHub/correspondencia/db/schema.ts)
- Añadir campos a `documents`: `currentUserId`, `groupedIntoDocumentId`, `folderCategory`, `archiveObservations`.
- Añadir campos a `documentHistory`: `action`, `receptionStatus`, `receivedAt`, `rejectionReason`, `justificationReason`, `derivationType`, `instructionCode`, `isUrgent`.

#### [MODIFY] [drizzle-document.repository.ts](file:///d:/Documentos/GitHub/correspondencia/src/modules/gestion-documental/infra/drizzle-document.repository.ts)
- Implementar métodos de repositorio para:
  - `receiveDocument({ documentId, userId, organizationId })`
  - `rejectDocument({ documentId, userId, reason, organizationId })`
  - `cancelDerivation({ documentId, userId, organizationId })`
  - `justifyDelay({ documentId, userId, reason, organizationId })`
  - `groupDocuments({ mainDocumentId, secondaryDocumentIds, organizationId })`
  - `archiveDocument({ documentId, folderCategory, observations, organizationId })`
  - `unarchiveDocument({ documentId, organizationId })`

---

### Component: Application Layer (`src/modules/gestion-documental/application/`)

#### [NEW] `receive-document.use-case.ts`
Caso de uso para que el destinatario asuma la custodia formal.

#### [NEW] `reject-document.use-case.ts`
Caso de uso para rechazar una derivación con motivo obligatorio.

#### [NEW] `cancel-derivation.use-case.ts`
Caso de uso para que el remitente revierta un envío antes de su aceptación.

#### [NEW] `justify-delay.use-case.ts`
Caso de uso para registrar justificación de paralización del trámite.

#### [NEW] `group-documents.use-case.ts`
Caso de uso para unificar 2 o más hojas de ruta.

#### [NEW] `archive-document.use-case.ts` / `unarchive-document.use-case.ts`
Casos de uso para mover trámites a carpetas de custodia o reabrirlos.

---

### Component: Presentation Layer (`src/app/inbox/` & `src/components/inbox/`)

#### [NEW] `src/app/inbox/incoming/page.tsx`
Página de **Bandeja Entrante** con acciones `[Recibir]` y `[Rechazar]`.

#### [NEW] `src/app/inbox/pending/page.tsx`
Página de **Bandeja de Pendientes** con acciones `[Derivar]`, `[Responder]`, `[Justificar]`, `[Agrupar]`, `[Archivar]`.

#### [NEW] `src/app/inbox/sent/page.tsx`
Página de **Bandeja de Enviados** con acción `[Cancelar Derivación]`.

#### [NEW] `src/app/inbox/archived/page.tsx`
Página de **Bandeja de Archivados** por carpetas con acción `[Quitar de Archivo]`.

---

## Verification Plan

### Automated Tests
- Pruebas unitarias de los casos de uso: `receive-document.use-case.test.ts`, `reject-document.use-case.test.ts`, `cancel-derivation.use-case.test.ts`, `archive-document.use-case.test.ts`.
- Comando: `pnpm exec vitest run`.
- Typecheck: `pnpm typecheck`.

### Manual Verification
- Pruebas E2E manuales siguiendo la guía en [quickstart.md](file:///d:/Documentos/GitHub/correspondencia/specs/012-flujo-bandejas-recepcion-rechazo/quickstart.md).
