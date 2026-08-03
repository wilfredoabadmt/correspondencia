# Implementation Plan: 014 - Control de Plazos, Semáforos de Mora y Notificaciones

**Branch**: `014-control-plazos-semaforos` | **Date**: 2026-08-02 | **Spec**: [specs/014-control-plazos-semaforos/spec.md](file:///d:/Documentos/GitHub/correspondencia/specs/014-control-plazos-semaforos/spec.md)

---

## Technical Context

**Language/Version**: TypeScript / Node.js (Next.js 14+ App Router)  
**Primary Dependencies**: Next.js, React 18, Tailwind CSS, shadcn/ui (Dialog, Badge), Drizzle ORM, tsyringe  
**Storage**: Cálculo de mora dinámico sobre campos existentes (`receptionDate`, `receivedAt`)  
**Testing**: Vitest (`pnpm exec vitest run`)  
**Target Platform**: Web application (Responsive)  
**Project Type**: Monolito Modular Web Service  
**Performance Goals**: < 100ms tiempo de renderizado de semáforos e insignias de mora  
**Constraints**: Multi-tenant isolation por `organizationId`  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Aislamiento Multi-tenant**: Filtro estricto por `organizationId` en notificaciones y Dashboard.
- [x] **Arquitectura Monolito Modular**: Helpers y componentes integrados en la estructura modular.
- [x] **Calidad Técnica**: `pnpm typecheck`, `pnpm lint`, `pnpm test` en verde.

---

## Project Structure & Artifacts

```text
specs/014-control-plazos-semaforos/
├── spec.md              # Especificación funcional de negocio
├── plan.md              # Plan de implementación técnica (este archivo)
├── research.md          # Investigación de cálculo de mora y niveles de semáforo
├── data-model.md        # Definición de helper de plazo y tipos
└── quickstart.md        # Guía de validación E2E manual
```

---

## Proposed Changes

### Component: Domain Utilities (`src/lib/` & `src/components/ui/`)

#### [NEW] `src/lib/deadline.utils.ts`
Función helper `getSemaphoreInfo(startDate)` que calcula días transcurridos y retorna severidad (`NORMAL`, `WARNING`, `OVERDUE`) e insignias CSS.

#### [NEW] `src/components/document/status-semaphore-badge.tsx`
Componente de UI para renderizar el semáforo visual en todas las tablas de correspondencia.

---

### Component: Notifications & Dashboard (`src/app/dashboard/` & `src/components/dashboard/`)

#### [NEW] `src/components/dashboard/overdue-notification-modal.tsx`
Componente client dialog emergente que avisa al usuario sobre trámites con morosidad $> 5$ días al ingresar al Dashboard.

#### [MODIFY] [drizzle-dashboard.repository.ts](file:///d:/Documentos/GitHub/correspondencia/src/modules/dashboard/infra/drizzle-dashboard.repository.ts)
Incluir el conteo de `overdueDocuments` (documentos recibidos con $> 5$ días de antigüedad) en los KPIs del Dashboard.

#### [MODIFY] [page.tsx](file:///d:/Documentos/GitHub/correspondencia/src/app/dashboard/page.tsx)
Actualizar Dashboard para mostrar la tarjeta de trámites en morosidad y renderizar el modal de notificación.

---

### Component: Inboxes (`src/app/inbox/`)

#### [MODIFY] [incoming-inbox-table.tsx](file:///d:/Documentos/GitHub/correspondencia/src/app/inbox/incoming/_components/incoming-inbox-table.tsx)
Añadir la columna de semáforo de días transcurridos.

#### [MODIFY] [pending-inbox-table.tsx](file:///d:/Documentos/GitHub/correspondencia/src/app/inbox/pending/_components/pending-inbox-table.tsx)
Añadir la columna de semáforo de días transcurridos.

---

## Verification Plan

### Automated Tests
- Pruebas unitarias del helper `deadline.utils.ts` (días $\le 2$, $3-4$, $\ge 5$).
- Comando: `pnpm exec vitest run`.
- Typecheck: `pnpm typecheck`.

### Manual Verification
- Pruebas E2E manuales siguiendo la guía en [quickstart.md](file:///d:/Documentos/GitHub/correspondencia/specs/014-control-plazos-semaforos/quickstart.md).
