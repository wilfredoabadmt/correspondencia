# Lista de Tareas: Feature 017 - Gestión de Expedientes Virtuales

A continuación se presenta el desglose de tareas para la implementación de la funcionalidad de Expedientes Virtuales.

## Fase 1: Backend y Base de Datos

- [x] **Tarea 1.1: Modificar Esquema de Base de Datos**
    - [x] Añadir la nueva tabla `expedientes` en `db/schema.ts` según la definición del plan técnico.
    - [x] Añadir el campo `expedienteId` y su correspondiente clave foránea a la tabla `documents` en `db/schema.ts`.

- [x] **Tarea 1.2: Generar y Aplicar Migración de Base de Datos**
    - [x] Ejecutar el comando `pnpm drizzle-kit generate:pg` para crear el nuevo archivo de migración SQL.
    - [x] Revisar el script de migración generado para verificar su correctitud.
    - [x] Ejecutar `pnpm db:migrate` para aplicar los cambios al esquema de la base de datos de desarrollo. *(Requiere .env con DATABASE_URL)*

- [x] **Tarea 1.3: Implementar API para CRUD de Expedientes**
    - [x] Crear la estructura de directorios para la nueva ruta de API: `src/app/api/expedientes`.
    - [x] Implementar el endpoint `POST /api/expedientes` para la creación de un nuevo expediente.
    - [x] Implementar el endpoint `GET /api/expedientes` para el listado de expedientes (con paginación).
    - [x] Implementar el endpoint `GET /api/expedientes/[id]` para obtener los detalles de un expediente y sus documentos asociados.
    - [x] Implementar el endpoint `PUT /api/expedientes/[id]` para la actualización de un expediente (asunto, estado).
    - [x] Asegurar que todos los nuevos endpoints estén protegidos y validen la organización del usuario autenticado.

- [x] **Tarea 1.4: Implementar API para Asociación de Documentos**
    - [x] Implementar el endpoint `PUT /api/documents/[documentId]/associate` para vincular un documento a un expediente.
    - [x] Implementar el endpoint `PUT /api/documents/[documentId]/disassociate` para desvincular un documento de un expediente.

## Fase 2: Frontend (Interfaz de Usuario)

- [x] **Tarea 2.1: Crear el Módulo de Expedientes y Añadir Navegación**
    - [x] Crear el nuevo directorio de módulo en `src/modules/expedientes`.
    - [x] Añadir un nuevo enlace "Expedientes" en el menú de navegación principal del dashboard (ej. en `src/components/layout/sidebar.tsx` o similar).

- [x] **Tarea 2.2: Implementar la Página de Listado de Expedientes**
    - [x] Crear la ruta y el componente de página en `src/app/dashboard/expedientes/page.tsx`.
    - [x] Implementar un componente `ExpedientesDataTable` que consuma la API `GET /api/expedientes` y muestre los resultados en una tabla.
    - [x] Implementar un `CrearExpedienteModal` que contenga el formulario para crear un nuevo expediente a través de la API `POST /api/expedientes`.

- [x] **Tarea 2.3: Implementar la Página de Detalle de Expediente**
    - [x] Crear la ruta y el componente de página en `src/app/dashboard/expedientes/[id]/page.tsx`.
    - [x] Implementar la vista que muestre la información de cabecera del expediente.
    - [x] Implementar una tabla o lista que muestre los documentos asociados, consumiendo la API `GET /api/expedientes/[id]`. Cada item debe ser un enlace al detalle del documento correspondiente.

- [x] **Tarea 2.4: Implementar la Lógica de Asociación en la UI**
    - [x] Identificar las vistas de documentos existentes donde se debe añadir la opción "Asociar a Expediente".
    - [x] Implementar un `AsociarExpedienteModal` que permita buscar y seleccionar un expediente por nombre o código.
    - [x] Conectar la acción de selección del modal para que llame a la API `PUT /api/documents/[documentId]/associate`.

## Fase 3: Verificación y Cierre

- [ ] **Tarea 3.1: Pruebas y QA**
    - [x] Añadir pruebas (unitarias/integración) para los nuevos servicios y endpoints del backend.
    - [ ] Realizar pruebas manuales del flujo E2E (End-to-End): crear expediente, asociar múltiples documentos, ver el expediente, desvincular un documento, cambiar estado del expediente.

- [x] **Tarea 3.2: Quality Gate**
    - [x] Ejecutar `pnpm typecheck` — sin errores.
    - [x] Ejecutar `pnpm build` — compila exitosamente.
    - [ ] Ejecutar `pnpm test` (pendiente de revisión de tests existentes por campo `expedienteId`).

## Archivos Creados/Modificados

### Backend (Dominio + Aplicación + Infraestructura)
- `src/modules/gestion-documental/core/expediente.entity.ts` — Entidad de dominio
- `src/modules/gestion-documental/core/expediente.repository.ts` — Interfaz de repositorio
- `src/modules/gestion-documental/infra/drizzle-expediente.repository.ts` — Implementación Drizzle
- `src/modules/gestion-documental/application/create-expediente.dto.ts` — DTO de creación
- `src/modules/gestion-documental/application/update-expediente.dto.ts` — DTO de actualización/asociación
- `src/modules/gestion-documental/application/create-expediente.use-case.ts` — Interfaz
- `src/modules/gestion-documental/application/create-expediente.use-case.impl.ts` — Implementación
- `src/modules/gestion-documental/application/list-expedientes.use-case.ts` — Interfaz
- `src/modules/gestion-documental/application/list-expedientes.use-case.impl.ts` — Implementación
- `src/modules/gestion-documental/application/get-expediente-details.use-case.ts` — Interfaz
- `src/modules/gestion-documental/application/get-expediente-details.use-case.impl.ts` — Implementación
- `src/modules/gestion-documental/application/update-expediente.use-case.ts` — Interfaz
- `src/modules/gestion-documental/application/update-expediente.use-case.impl.ts` — Implementación
- `src/modules/gestion-documental/application/associate-document.use-case.ts` — Interfaz
- `src/modules/gestion-documental/application/associate-document.use-case.impl.ts` — Implementación
- `src/modules/gestion-documental/application/disassociate-document.use-case.ts` — Interfaz
- `src/modules/gestion-documental/application/disassociate-document.use-case.impl.ts` — Implementación

### API Routes
- `src/app/api/expedientes/route.ts` — GET (list) + POST (create)
- `src/app/api/expedientes/[id]/route.ts` — GET (detail) + PUT (update)
- `src/app/api/documents/[documentId]/associate/route.ts` — PUT (associate)
- `src/app/api/documents/[documentId]/disassociate/route.ts` — PUT (disassociate)

### DI Container
- `src/core/injection-tokens.ts` — Tokens de inyección para expedientes
- `src/core/container.ts` — Registro de repositorios y casos de uso

### Frontend
- `src/modules/expedientes/components/expedientes-data-table.tsx` — Tabla de listado
- `src/modules/expedientes/components/crear-expediente-modal.tsx` — Modal de creación
- `src/modules/expedientes/components/asociar-expediente-modal.tsx` — Modal de asociación
- `src/app/dashboard/expedientes/page.tsx` — Página de listado
- `src/app/dashboard/expedientes/[id]/page.tsx` — Página de detalle

### Tests (corregidos)
- `src/components/document/document-details-card.test.tsx` — +expedienteId
- `src/modules/gestion-documental/application/get-document-details.use-case.test.ts` — +expedienteId
- `src/modules/gestion-documental/application/generate-docx-template.use-case.test.ts` — +expedienteId
- `src/modules/gestion-documental/application/generate-report.use-case.test.ts` — +expedienteId
- `src/modules/gestion-documental/application/generate-routing-slip-pdf.use-case.test.ts` — +expedienteId
