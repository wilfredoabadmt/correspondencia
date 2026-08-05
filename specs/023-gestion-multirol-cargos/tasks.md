# Lista de Tareas: Feature 023 - Gestión Multi-Rol de Usuarios y Cargos Institucionales por Área

## Fase 1: Base de Datos y Backend

- [x] **Tarea 1.1: Esquema Drizzle y Migración**
    - [x] Añadir columna `jobTitle` en `users` y crear la tabla N:M `user_roles` (`db/schema.ts`).
    - [x] Generar migración con `pnpm db:generate` (`db/migrations/0008_blushing_rhodey.sql`).

- [x] **Tarea 1.2: Repositorio y Caso de Uso**
    - [x] Crear `IUserRoleAssignmentRepository` e implementación `DrizzleUserRoleAssignmentRepository`.
    - [x] Crear `AssignUserRolesUseCase`.
    - [x] Registrar tokens en `injection-tokens.ts` y container `container.ts`.

- [x] **Tarea 1.3: Endpoints de API**
    - [x] Endpoints `GET` & `POST /api/users/[id]/multi-roles`.

## Fase 2: Frontend e Integración en UI

- [x] **Tarea 2.1: Gestión de Usuarios Multi-Rol**
    - [x] Actualizar modal `/admin/users` (`UserManagementTable`) para soportar checkbox multi-select de roles y campo `Cargo Institucional` (`jobTitle`).

## Fase 3: Quality Gate y Pruebas

- [x] **Tarea 3.1: Pruebas Unitarias**
    - [x] Pruebas unitarias para `AssignUserRolesUseCase` (32/32 archivos, 60/60 pruebas pasadas).
- [x] **Tarea 3.2: Quality Gate**
    - [x] `pnpm typecheck` — 0 errores.
    - [x] `pnpm test` — 60/60 pruebas en verde.
    - [x] `pnpm build` — Compilación de producción exitosa.
