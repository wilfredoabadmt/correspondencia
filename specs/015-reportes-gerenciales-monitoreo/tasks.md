# Tareas: 015 - Reportes Gerenciales, Monitoreo y Exportaciones (Excel / PDF)

## 1. Fase 1: Setup y Dependencias

- [ ] T001 Instalar paquete `exceljs` en `package.json` para generación de hojas de cálculo Excel.

## 2. Fase 2: Capa de Datos y Servicios de Exportación (Foundational Layer)

- [ ] T002 Crear interfaz `IExcelExporterService` en `src/modules/gestion-documental/core/excel-exporter.service.ts`.
- [ ] T003 Implementar `ExceljsExporterService` con estilos profesionales en `src/modules/gestion-documental/infra/exceljs-exporter.service.ts`.
- [ ] T004 Registrar los servicios en la inyección de dependencias `src/core/container.ts` e `src/core/injection-tokens.ts`.

## 3. Fase 3: User Story 1 (US1) - Módulo de Consulta Gerencial `/reports` (P1)

- [ ] T005 [P] [US1] Crear el caso de uso `GenerateReportUseCase` en `src/modules/gestion-documental/application/generate-report.use-case.ts`.
- [ ] T006 [P] [US1] Crear las pruebas unitarias para `GenerateReportUseCase` en `src/modules/gestion-documental/application/generate-report.use-case.test.ts`.
- [ ] T007 [US1] Crear componente de formulario de filtros `ReportFilters.tsx` en `src/app/reports/_components/report-filters.tsx`.
- [ ] T008 [US1] Crear la página del módulo de **Reportes Gerenciales** en `src/app/reports/page.tsx`.

## 4. Fase 4: User Story 2 (US2) - Exportación a Excel `.xlsx` (P1)

- [ ] T009 [US2] Crear el Route Handler para descarga de Excel `.xlsx` en `src/app/api/reports/excel/route.ts`.

## 5. Fase 5: User Story 3 (US3) - Exportación a Reporte PDF (P2)

- [ ] T010 [US3] Crear el Route Handler para descarga del reporte PDF en `src/app/api/reports/pdf/route.ts`.
- [ ] T011 [US3] Agregar el botón de acceso directo a **"Reportes Gerenciales"** en la barra lateral en `src/components/layout/sidebar.tsx`.

## 6. Fase 6: Polishing y Quality Gate

- [ ] T012 Ejecutar validación `pnpm typecheck` asegurando cero errores de compilación.
- [ ] T013 Ejecutar suite de pruebas completa `pnpm exec vitest run` verificando que todos los tests pasen limpiamente.
- [ ] T014 Verificar escenarios manuales E2E de consulta y exportaciones descritos en `quickstart.md`.
