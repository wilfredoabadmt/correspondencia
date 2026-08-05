# Lista de Tareas: Feature 019 - Gestor de CITEs Automáticos Configurables

## Fase 1: Base de Datos y Backend

- [x] **Tarea 1.1: Crear Esquema Drizzle y Migración**
    - [x] Definir la tabla `cite_configs` en `db/schema.ts`.
    - [x] Generar migración con `pnpm db:generate` (`db/migrations/0004_warm_doctor_spectrum.sql`).

- [x] **Tarea 1.2: Repositorio y Casos de Uso**
    - [x] Crear `ICiteConfigRepository` e implementación `DrizzleCiteConfigRepository`.
    - [x] Crear `GenerateNextCiteUseCase` para formatear patrones e incrementar la secuencia.
    - [x] Crear `ManageCiteConfigsUseCase` (listar y guardar reglas).
    - [x] Registrar tokens en `injection-tokens.ts` y container `container.ts`.

- [x] **Tarea 1.3: Endpoints de API**
    - [x] Implementar `GET /api/admin/cites` y `POST /api/admin/cites`.
    - [x] Integrar generación de CITE en `RegisterDocumentUseCase`.

## Fase 2: Frontend (Interfaz de Administración)

- [x] **Tarea 2.1: Vista de Administración de CITEs**
    - [x] Crear la página `/admin/cites/page.tsx`.
    - [x] Crear formulario modal `CiteConfigModal` para crear/editar patrones de CITE.

## Fase 3: Quality Gate y Pruebas

- [x] **Tarea 3.1: Pruebas Unitarias**
    - [x] Pruebas unitarias para `GenerateNextCiteUseCase` y formateador de variables dinámicas (`{ENTIDAD}`, `{AREA}`, `{NUMERO:4}`, `{AÑO}`) (54/54 pruebas pasando).
- [x] **Tarea 3.2: Quality Gate**
    - [x] `pnpm typecheck` — 0 errores.
    - [x] `pnpm test` — 54/54 pruebas en verde.
    - [x] `pnpm build` — Compilación de producción exitosa.
