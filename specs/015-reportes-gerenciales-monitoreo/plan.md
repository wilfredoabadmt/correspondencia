# Implementation Plan: 015 - Reportes Gerenciales, Monitoreo y Exportaciones (Excel / PDF)

**Branch**: `main` | **Date**: 2026-08-02 | **Spec**: [specs/015-reportes-gerenciales-monitoreo/spec.md](file:///d:/Documentos/GitHub/correspondencia/specs/015-reportes-gerenciales-monitoreo/spec.md)

---

## Technical Context

**Language/Version**: TypeScript / Node.js (Next.js 14+ App Router)  
**Primary Dependencies**: Next.js, `exceljs` (generación de hojas Excel), `pdfkit` (generación de reportes PDF), Drizzle ORM, tsyringe  
**Storage**: Generación en memoria en el servidor (Stream/Buffer binario)  
**Testing**: Vitest (`pnpm exec vitest run`)  
**Target Platform**: Web application  
**Project Type**: Monolito Modular Web Service  
**Performance Goals**: Generación de reportes Excel y PDF en < 500ms para planillas de hasta 1,000 registros  
**Constraints**: Multi-tenant isolation por `organizationId`  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Aislamiento Multi-tenant**: Filtro obligatorio por `organizationId` en todas las consultas y descargas.
- [x] **Arquitectura Monolito Modular**: Módulo `gestion-documental` extendido con servicios de reportes.
- [x] **Calidad Técnica**: `pnpm typecheck`, `pnpm lint`, `pnpm test` en verde.

---

## Project Structure & Artifacts

```text
specs/015-reportes-gerenciales-monitoreo/
├── spec.md              # Especificación funcional de negocio
├── plan.md              # Plan de implementación técnica (este archivo)
├── research.md          # Investigación de librerías Excel y PDF gerencial
├── data-model.md        # DTOs de parámetros de reporte y resultados
└── quickstart.md        # Guía de validación E2E manual
```

---

## Proposed Changes

### Component: Domain & Application Layer (`src/modules/gestion-documental/`)

#### [NEW] `src/modules/gestion-documental/core/excel-exporter.service.ts`
Interfaz y DTOs para la generación de reportes en Excel.

#### [NEW] `src/modules/gestion-documental/infra/exceljs-exporter.service.ts`
Servicio de infraestructura utilizando `exceljs` para compilar la planilla Excel.

#### [NEW] `src/modules/gestion-documental/application/generate-report.use-case.ts`
Caso de uso para consultar correspondencia filtrada y calcular estadísticas de resumen.

---

### Component: Endpoints & UI (`src/app/reports/` & `src/app/api/`)

#### [NEW] `src/app/reports/page.tsx` & `src/app/reports/_components/report-filters.tsx`
Página gerencial con formulario de filtros combinados, tarjetas resumen y tabla de resultados.

#### [NEW] `src/app/api/reports/excel/route.ts`
Route Handler para la descarga del reporte Excel (`.xlsx`).

#### [NEW] `src/app/api/reports/pdf/route.ts`
Route Handler para la descarga del reporte PDF (`.pdf`).

#### [MODIFY] [sidebar.tsx](file:///d:/Documentos/GitHub/correspondencia/src/components/layout/sidebar.tsx)
Añadir el botón de acceso **"Reportes Gerenciales"**.

---

## Verification Plan

### Automated Tests
- Pruebas unitarias de `GenerateReportUseCase` y compiladores de Excel/PDF.
- Comando: `pnpm exec vitest run`.
- Typecheck: `pnpm typecheck`.

### Manual Verification
- Pruebas E2E manuales siguiendo la guía en [quickstart.md](file:///d:/Documentos/GitHub/correspondencia/specs/015-reportes-gerenciales-monitoreo/quickstart.md).
