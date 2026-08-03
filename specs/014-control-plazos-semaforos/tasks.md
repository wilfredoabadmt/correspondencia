# Tareas: 014 - Control de Plazos, Semáforos de Mora y Alertas

## 1. Fase 1: Setup y Utilidades Base

- [x] T001 Crear helper de cálculo de morosidad `getSemaphoreInfo` en `src/lib/deadline.utils.ts`.
- [x] T002 Crear pruebas unitarias para `getSemaphoreInfo` en `src/lib/deadline.utils.test.ts`.

## 2. Fase 2: Componentes UI de Semáforo (Foundational Layer)

- [x] T003 [P] Crear el componente visual `<StatusSemaphoreBadge />` en `src/components/document/status-semaphore-badge.tsx`.
- [x] T004 [P] Crear la prueba unitaria para `<StatusSemaphoreBadge />` en `src/components/document/status-semaphore-badge.test.tsx`.

## 3. Fase 3: User Story 1 (US1) - Semáforos en Bandejas (P1)

- [x] T005 [US1] Integrar la columna de Semáforo de Días Transcurridos en `src/app/inbox/incoming/_components/incoming-inbox-table.tsx`.
- [x] T006 [US1] Integrar la columna de Semáforo de Días Transcurridos en `src/app/inbox/pending/_components/pending-inbox-table.tsx`.
- [x] T007 [US1] Integrar la columna de Semáforo de Días Transcurridos en `src/app/inbox/sent/_components/sent-inbox-table.tsx`.

## 4. Fase 4: User Story 2 (US2) - Modal Emergente de Notificación de Morosidad (P1)

- [x] T008 [P] [US2] Crear el componente client Dialog `<OverdueNotificationModal />` en `src/components/dashboard/overdue-notification-modal.tsx`.
- [x] T009 [US2] Integrar `<OverdueNotificationModal />` en la página del Dashboard en `src/app/dashboard/page.tsx`.

## 5. Fase 5: User Story 3 (US3) - Métricas de Morosidad en Dashboard (P2)

- [x] T010 [US3] Actualizar el repositorio `DrizzleDashboardRepository` en `src/modules/dashboard/infra/drizzle-dashboard.repository.ts` para contabilizar trámites con morosidad $> 5$ días.
- [x] T011 [US3] Actualizar la tarjeta de KPIs en `src/app/dashboard/page.tsx` agregando la métrica de "Trámites con Morosidad (> 5 días)".

## 6. Fase 6: Polishing y Quality Gate

- [x] T012 Ejecutar validación `pnpm typecheck` asegurando cero errores de compilación.
- [x] T013 Ejecutar suite de pruebas completa `pnpm exec vitest run` verificando que todos los tests pasen limpiamente.
- [x] T014 Verificar escenarios manuales E2E de semáforos y alertas descritos en `quickstart.md`.
