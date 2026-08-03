# Implementation Plan: 016 - Perfil de Usuario, Destinatarios Frecuentes y Cambio de Contraseña

**Branch**: `main` | **Date**: 2026-08-02 | **Spec**: [specs/016-perfil-usuario-destinatarios-frecuentes/spec.md](file:///d:/Documentos/GitHub/correspondencia/specs/016-perfil-usuario-destinatarios-frecuentes/spec.md)

---

## Technical Context

**Language/Version**: TypeScript / Node.js (Next.js 14+ App Router)  
**Primary Dependencies**: Next.js, React 18, Tailwind CSS, shadcn/ui, `bcryptjs`, Drizzle ORM, tsyringe  
**Storage**: PostgreSQL (`favorite_recipients` table)  
**Testing**: Vitest (`pnpm exec vitest run`)  
**Target Platform**: Web application  
**Project Type**: Monolito Modular Web Service  
**Performance Goals**: Actualización de perfil y selección de frecuentes en < 150ms  
**Constraints**: Multi-tenant isolation por `organizationId`  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Aislamiento Multi-tenant**: Filtro estricto por `organizationId` en tabla `favorite_recipients`.
- [x] **Seguridad**: Cambio de contraseña validado con `bcryptjs`.
- [x] **Calidad Técnica**: `pnpm typecheck`, `pnpm lint`, `pnpm test` en verde.

---

## Project Structure & Artifacts

```text
specs/016-perfil-usuario-destinatarios-frecuentes/
├── spec.md              # Especificación funcional de negocio
├── plan.md              # Plan de implementación técnica (este archivo)
├── research.md          # Investigación de contraseña segura y favoritas
├── data-model.md        # Esquema de tabla favorite_recipients y DTOs
└── quickstart.md        # Guía de validación E2E manual
```

---

## Proposed Changes

### Component: Database & Core Domain (`db/` & `src/modules/users/`)

#### [MODIFY] [schema.ts](file:///d:/Documentos/GitHub/correspondencia/db/schema.ts)
Añadir la tabla `favoriteRecipients`.

#### [NEW] `src/modules/users/core/favorite-recipients.repository.ts`
Interfaz del repositorio de destinatarios frecuentes.

#### [NEW] `src/modules/users/infra/drizzle-favorite-recipients.repository.ts`
Implementación con Drizzle ORM.

---

### Component: Application Layer (`src/modules/users/application/`)

#### [NEW] `change-password.use-case.ts`
Caso de uso para verificación e ingreso de nueva contraseña.

#### [NEW] `manage-favorites.use-case.ts`
Caso de uso para añadir/remover/listar destinatarios frecuentes.

---

### Component: UI & Pages (`src/app/profile/`)

#### [NEW] `src/app/profile/page.tsx` & `src/app/profile/_actions.ts`
Vista de Perfil de Usuario, cambio de contraseña y gestión de frecuentes.

#### [MODIFY] [derive-document-form.tsx](file:///d:/Documentos/GitHub/correspondencia/src/components/document/derive-document-form.tsx)
Integrar la sección de accesos rápidos a **⭐ Frecuentes**.

---

## Verification Plan

### Automated Tests
- Pruebas unitarias de `ChangePasswordUseCase` y `ManageFavoritesUseCase`.
- Comando: `pnpm exec vitest run`.
- Typecheck: `pnpm typecheck`.

### Manual Verification
- Pruebas E2E manuales siguiendo la guía en [quickstart.md](file:///d:/Documentos/GitHub/correspondencia/specs/016-perfil-usuario-destinatarios-frecuentes/quickstart.md).
