# Tareas: 012 - Flujo Completo de Bandejas (Recepción, Rechazo, Cancelar Derivación, Agrupar, Justificar y Archivar/Desarchivar)

## 1. Fase 1: Setup e Infraestructura

- [x] T001 Actualizar esquema de base de datos en `db/schema.ts` agregando los campos de custodia, estado y agrupación (`currentUserId`, `groupedIntoDocumentId`, `folderCategory`, `archiveObservations`, `receptionStatus`, `receivedAt`, `rejectionReason`, `justificationReason`, `action`).
- [x] T002 Generar y aplicar migración Drizzle mediante `pnpm drizzle-kit generate` y `pnpm drizzle-kit migrate`.

## 2. Fase 2: Capa de Datos y Contratos (Foundational Layer)

- [x] T003 Actualizar interfaz del repositorio `IDocumentRepository` y entidades en `src/modules/gestion-documental/core/document.repository.ts`.
- [x] T004 Implementar métodos de cambio de estado de custodia en `src/modules/gestion-documental/infra/drizzle-document.repository.ts`.
- [x] T005 [P] Registrar los nuevos casos de uso y repositorios en la Inyección de Dependencias `src/core/container.ts` e `src/core/injection-tokens.ts`.

## 3. Fase 3: User Story 1 (US1) - Recepción y Rechazo de Correspondencia Entrante (P1)

- [x] T006 [P] [US1] Crear el caso de uso `ReceiveDocumentUseCase` en `src/modules/gestion-documental/application/receive-document.use-case.ts`.
- [x] T007 [P] [US1] Crear las pruebas unitarias para `ReceiveDocumentUseCase` en `src/modules/gestion-documental/application/receive-document.use-case.test.ts`.
- [x] T008 [P] [US1] Crear el caso de uso `RejectDocumentUseCase` en `src/modules/gestion-documental/application/reject-document.use-case.ts`.
- [x] T009 [P] [US1] Crear las pruebas unitarias para `RejectDocumentUseCase` en `src/modules/gestion-documental/application/reject-document.use-case.test.ts`.
- [x] T010 [US1] Crear Server Actions para recepcionar y rechazar en `src/app/inbox/incoming/_actions.ts`.
- [x] T011 [US1] Crear componente UI `IncomingInboxTable.tsx` y la página de **Bandeja Entrante** en `src/app/inbox/incoming/page.tsx`.

## 4. Fase 4: User Story 2 (US2) - Cancelación de Derivación en Enviados (P1)

- [x] T012 [P] [US2] Crear el caso de uso `CancelDerivationUseCase` en `src/modules/gestion-documental/application/cancel-derivation.use-case.ts`.
- [x] T013 [P] [US2] Crear las pruebas unitarias para `CancelDerivationUseCase` en `src/modules/gestion-documental/application/cancel-derivation.use-case.test.ts`.
- [x] T014 [US2] Crear Server Action `cancelDerivationAction` en `src/app/inbox/sent/_actions.ts`.
- [x] T015 [US2] Crear componente UI `SentInboxTable.tsx` y la página de **Bandeja de Enviados** en `src/app/inbox/sent/page.tsx`.

## 5. Fase 5: User Story 3 (US3) - Bandeja de Pendientes (Justificar, Agrupar y Archivar) (P2)

- [x] T016 [P] [US3] Crear el caso de uso `JustifyDelayUseCase` en `src/modules/gestion-documental/application/justify-delay.use-case.ts`.
- [x] T017 [P] [US3] Crear el caso de uso `GroupDocumentsUseCase` en `src/modules/gestion-documental/application/group-documents.use-case.ts`.
- [x] T018 [P] [US3] Crear el caso de uso `ArchiveDocumentUseCase` en `src/modules/gestion-documental/application/archive-document.use-case.ts`.
- [x] T019 [US3] Crear Server Actions para justificar, agrupar y archivar en `src/app/inbox/pending/_actions.ts`.
- [x] T020 [US3] Crear los modales/formularios `JustifyModal.tsx`, `GroupModal.tsx` y `ArchiveModal.tsx` en `src/components/inbox/`.
- [x] T021 [US3] Crear la página de **Bandeja de Pendientes** en `src/app/inbox/pending/page.tsx`.

## 6. Fase 6: User Story 4 (US4) - Bandeja de Archivados y Desarchivar (P2)

- [x] T022 [P] [US4] Crear el caso de uso `UnarchiveDocumentUseCase` en `src/modules/gestion-documental/application/unarchive-document.use-case.ts`.
- [x] T023 [US4] Crear Server Actions para desarchivar y consultar carpetas en `src/app/inbox/archived/_actions.ts`.
- [x] T024 [US4] Crear componente UI `ArchivedFolderGrid.tsx` y la página de **Bandeja de Archivados** en `src/app/inbox/archived/page.tsx`.

## 7. Fase 7: Polishing, Navegación y Quality Gate

- [x] T025 Actualizar la barra de navegación principal y sidebar en `src/components/layout/sidebar.tsx` añadiendo el menú unificado de **Bandeja (Entrante, Pendientes, Enviados, Archivados)**.
- [x] T026 Ejecutar validación `pnpm typecheck` asegurando cero errores.
- [x] T027 Ejecutar suite completa `pnpm exec vitest run` asegurando que todos los tests pasen limpiamente.
- [x] T028 Ejecutar validaciones E2E descritas en `quickstart.md`.
