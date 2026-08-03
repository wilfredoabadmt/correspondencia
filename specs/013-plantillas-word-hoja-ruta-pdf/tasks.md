# Tareas: 013 - Generación de Plantillas Word (.docx) e Impresión de Hoja de Ruta Oficial PDF

## 1. Fase 1: Setup y Dependencias

- [x] T001 Instalar dependencias necesarias para generación de documentos Word y PDF en `package.json` (`docx`, `pdfkit` o equivalente).

## 2. Fase 2: Capa de Datos y Servicios de Infraestructura (Foundational Layer)

- [x] T002 Crear interfaz de servicio `IDocxGeneratorService` y DTOs en `src/modules/gestion-documental/core/docx-generator.service.ts`.
- [x] T003 Crear interfaz de servicio `IPdfGeneratorService` y DTOs en `src/modules/gestion-documental/core/pdf-generator.service.ts`.
- [x] T004 Implementar `DocxGeneratorService` con plantilla institucional en `src/modules/gestion-documental/infra/docx-generator.service.ts`.
- [x] T005 Implementar `PdfGeneratorService` con formato oficial de Hoja de Ruta y proveídos en `src/modules/gestion-documental/infra/pdf-generator.service.ts`.
- [x] T006 [P] Registrar los servicios en el contenedor de inyección de dependencias `src/core/container.ts` e `src/core/injection-tokens.ts`.

## 3. Fase 3: User Story 1 (US1) - Descarga de Plantilla Word `.docx` Pre-llenada (P1)

- [x] T007 [P] [US1] Crear el caso de uso `GenerateDocxTemplateUseCase` en `src/modules/gestion-documental/application/generate-docx-template.use-case.ts`.
- [x] T008 [P] [US1] Crear las pruebas unitarias para `GenerateDocxTemplateUseCase` en `src/modules/gestion-documental/application/generate-docx-template.use-case.test.ts`.
- [x] T009 [US1] Crear el Route Handler para descarga binaria `.docx` en `src/app/api/documents/[documentId]/template/route.ts`.

## 4. Fase 4: User Story 2 (US2) - Impresión de Hoja de Ruta Oficial PDF (P1)

- [x] T010 [P] [US2] Crear el caso de uso `GenerateRoutingSlipPdfUseCase` en `src/modules/gestion-documental/application/generate-routing-slip-pdf.use-case.ts`.
- [x] T011 [P] [US2] Crear las pruebas unitarias para `GenerateRoutingSlipPdfUseCase` en `src/modules/gestion-documental/application/generate-routing-slip-pdf.use-case.test.ts`.
- [x] T012 [US2] Crear el Route Handler para visualización/descarga PDF en `src/app/api/documents/[documentId]/routing-slip/route.ts`.

## 5. Fase 5: User Story 3 (US3) - Integración UI y Botones de Acción (P2)

- [x] T013 [US3] Agregar botones **[Descargar Plantilla (.docx)]** y **[Imprimir Hoja de Ruta (PDF)]** en `src/components/document/document-details-card.tsx`.
- [x] T014 [US3] Agregar botón de **[Imprimir Hoja de Ruta]** en las tablas de bandejas en `src/app/inbox/pending/_components/pending-inbox-table.tsx`.

## 6. Fase 6: Polishing y Quality Gate

- [x] T015 Ejecutar validación `pnpm typecheck` asegurando cero errores de compilación.
- [x] T016 Ejecutar suite de pruebas completa `pnpm exec vitest run` verificando que todos los tests pasen limpiamente.
- [x] T017 Verificar escenarios manuales E2E de descarga Word e impresión PDF descritos en `quickstart.md`.
