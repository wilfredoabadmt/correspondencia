# Lista de Tareas: Feature 017 - Gestión de Expedientes Virtuales

A continuación se presenta el desglose de tareas para la implementación de la funcionalidad de Expedientes Virtuales.

## Fase 1: Backend y Base de Datos

- [x] **Tarea 1.1: Modificar Esquema de Base de Datos**
    - [x] Añadir la nueva tabla `expedientes` en `db/schema.ts` según la definición del plan técnico.
    - [x] Añadir el campo `expedienteId` y su correspondiente clave foránea a la tabla `documents` en `db/schema.ts`.

- [ ] **Tarea 1.2: Generar y Aplicar Migración de Base de Datos**
    - [x] Ejecutar el comando `pnpm drizzle-kit generate:pg` para crear el nuevo archivo de migración SQL.
    - [x] Revisar el script de migración generado para verificar su correctitud.
    - [ ] Ejecutar `pnpm db:migrate` para aplicar los cambios al esquema de la base de datos de desarrollo.

- [ ] **Tarea 1.3: Implementar API para CRUD de Expedientes**
    - [ ] Crear la estructura de directorios para la nueva ruta de API: `src/app/api/expedientes`.
    - [ ] Implementar el endpoint `POST /api/expedientes` para la creación de un nuevo expediente.
    - [ ] Implementar el endpoint `GET /api/expedientes` para el listado de expedientes (con paginación).
    - [ ] Implementar el endpoint `GET /api/expedientes/[id]` para obtener los detalles de un expediente y sus documentos asociados.
    - [ ] Implementar el endpoint `PUT /api/expedientes/[id]` para la actualización de un expediente (asunto, estado).
    - [ ] Asegurar que todos los nuevos endpoints estén protegidos y validen la organización del usuario autenticado.

- [ ] **Tarea 1.4: Implementar API para Asociación de Documentos**
    - [ ] Implementar el endpoint `PUT /api/documents/[documentId]/associate` para vincular un documento a un expediente.
    - [ ] Implementar el endpoint `PUT /api/documents/[documentId]/disassociate` para desvincular un documento de un expediente.

## Fase 2: Frontend (Interfaz de Usuario)

- [x] **Tarea 2.1: Crear el Módulo de Expedientes y Añadir Navegación**
    - [x] Crear el nuevo directorio de módulo en `src/modules/expedientes`.
    - [x] Añadir un nuevo enlace "Expedientes" en el menú de navegación principal del dashboard (ej. en `src/components/layout/sidebar.tsx` o similar).

- [ ] **Tarea 2.2: Implementar la Página de Listado de Expedientes**
    - [ ] Crear la ruta y el componente de página en `src/app/dashboard/expedientes/page.tsx`.
    - [ ] Implementar un componente `ExpedientesDataTable` que consuma la API `GET /api/expedientes` y muestre los resultados en una tabla.
    - [ ] Implementar un `CrearExpedienteModal` que contenga el formulario para crear un nuevo expediente a través de la API `POST /api/expedientes`.

- [ ] **Tarea 2.3: Implementar la Página de Detalle de Expediente**
    - [ ] Crear la ruta y el componente de página en `src/app/dashboard/expedientes/[id]/page.tsx`.
    - [ ] Implementar la vista que muestre la información de cabecera del expediente.
    - [ ] Implementar una tabla o lista que muestre los documentos asociados, consumiendo la API `GET /api/expedientes/[id]`. Cada item debe ser un enlace al detalle del documento correspondiente.

- [ ] **Tarea 2.4: Implementar la Lógica de Asociación en la UI**
    - [ ] Identificar las vistas de documentos existentes donde se debe añadir la opción "Asociar a Expediente".
    - [ ] Implementar un `AsociarExpedienteModal` que permita buscar y seleccionar un expediente por nombre o código.
    - [ ] Conectar la acción de selección del modal para que llame a la API `PUT /api/documents/[documentId]/associate`.

## Fase 3: Verificación y Cierre

- [ ] **Tarea 3.1: Pruebas y QA**
    - [ ] Añadir pruebas (unitarias/integración) para los nuevos servicios y endpoints del backend.
    - [ ] Realizar pruebas manuales del flujo E2E (End-to-End): crear expediente, asociar múltiples documentos, ver el expediente, desvincular un documento, cambiar estado del expediente.

- [ ] **Tarea 3.2: Quality Gate**
    - [ ] Ejecutar todos los comandos de verificación del proyecto (`pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`).
    - [ ] Asegurarse de que todos los comandos finalizan con éxito y no hay regresiones.
