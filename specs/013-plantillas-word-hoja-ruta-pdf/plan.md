# Implementation Plan: 013 - Generación de Plantillas Word (.docx) e Impresión de Hoja de Ruta Oficial PDF

**Branch**: `013-plantillas-word-hoja-ruta-pdf` | **Date**: 2026-08-02 | **Spec**: [specs/013-plantillas-word-hoja-ruta-pdf/spec.md](file:///d:/Documentos/GitHub/correspondencia/specs/013-plantillas-word-hoja-ruta-pdf/spec.md)

---

## Technical Context

**Language/Version**: TypeScript / Node.js (Next.js 14+ App Router)  
**Primary Dependencies**: Next.js, `docx` (generador de documentos Word), `@react-pdf/renderer` o `pdfkit` (generador PDF), Drizzle ORM, tsyringe  
**Storage**: Generación binaria en memoria (Stream/Buffer) en el servidor  
**Testing**: Vitest (`pnpm exec vitest run`)  
**Target Platform**: Web application (Navegador e impresoras)  
**Project Type**: Monolito Modular Web Service  
**Performance Goals**: Generación de PDF y `.docx` en < 300ms  
**Constraints**: Multi-tenant isolation por `organizationId` antes de servir cualquier archivo binario  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Aislamiento Multi-tenant**: Validación estricta de `organizationId` en endpoints de descarga.
- [x] **Arquitectura Monolito Modular**: Servicios encapsulados en el módulo `gestion-documental`.
- [x] **Inyección de Dependencias**: Generadores registrados en `tsyringe` (`container.ts`).
- [x] **Calidad Técnica**: `pnpm typecheck`, `pnpm lint`, `pnpm test` en verde.

---

## Project Structure & Artifacts

```text
specs/013-plantillas-word-hoja-ruta-pdf/
├── spec.md              # Especificación funcional de negocio
├── plan.md              # Plan de implementación técnica (este archivo)
├── research.md          # Investigación de librerías de generación Word y PDF
├── data-model.md        # DTOs de plantillas y proveídos de Hoja de Ruta
└── quickstart.md        # Guía de validación E2E manual
```

---

## Proposed Changes

### Component: Application Layer & Generators (`src/modules/gestion-documental/application/`)

#### [NEW] `generate-docx-template.use-case.ts`
Caso de uso para consultar datos del documento y estructurar el Buffer `.docx`.

#### [NEW] `generate-routing-slip-pdf.use-case.ts`
Caso de uso para consultar el historial y generar el Buffer PDF de la Hoja de Ruta Oficial.

#### [NEW] `src/modules/gestion-documental/infra/docx-generator.service.ts`
Servicio de infraestructura que utiliza la librería `docx` para compilar el documento Word.

#### [NEW] `src/modules/gestion-documental/infra/pdf-generator.service.ts`
Servicio de infraestructura que compone el PDF de la Hoja de Ruta Oficial con la plantilla de proveídos institucionales.

---

### Component: Endpoints & UI (`src/app/api/` & `src/components/document/`)

#### [NEW] `src/app/api/documents/[documentId]/template/route.ts`
Route Handler para servir la descarga binaria `.docx`.

#### [NEW] `src/app/api/documents/[documentId]/routing-slip/route.ts`
Route Handler para servir el PDF de la Hoja de Ruta Oficial.

#### [MODIFY] [document-details-card.tsx](file:///d:/Documentos/GitHub/correspondencia/src/components/document/document-details-card.tsx)
Añadir botones **[Descargar Plantilla (.docx)]** e **[Imprimir Hoja de Ruta (PDF)]**.

---

## Verification Plan

### Automated Tests
- Pruebas unitarias de la generación de buffers `.docx` y `.pdf`.
- Comando: `pnpm exec vitest run`.
- Typecheck: `pnpm typecheck`.

### Manual Verification
- Pruebas E2E manuales siguiendo la guía en [quickstart.md](file:///d:/Documentos/GitHub/correspondencia/specs/013-plantillas-word-hoja-ruta-pdf/quickstart.md).
