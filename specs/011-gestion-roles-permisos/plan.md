# Plan Técnico: 011 - Gestión de Roles y Permisos Granulares

## 1. Objetivo

Permitir a los administradores de cada organización definir roles personalizados y asignar permisos granulares a estos roles, aumentando la flexibilidad y seguridad del control de acceso en el sistema.

## 2. Arquitectura y Estrategia

Esta feature implica una modificación fundamental en cómo se gestiona la autorización en el sistema, pasando de roles fijos a un sistema basado en roles y permisos configurables.

1.  **Nueva Sección de Administración**: Se creará una nueva página (`/admin/roles`) accesible solo para `ADMINISTRADOR`es, dedicada a la gestión de roles y sus permisos.

2.  **Carga Inicial con Server Components**: La página principal de gestión de roles (`page.tsx`) será un Server Component que obtendrá la lista inicial de roles y la lista de permisos disponibles a través de casos de uso. Esto asegura que la lista se cargue rápidamente y con el contexto de seguridad adecuado.

3.  **Interacción con Client Components y Server Actions**: Las operaciones de creación, edición y eliminación de roles se manejarán mediante Client Components (formularios, modales de confirmación) que interactuarán con el backend a través de Server Actions.

4.  **Backend (Casos de Uso y Repositorios)**: Se crearán nuevos repositorios (`IRoleRepository`, `IPermissionRepository`) y casos de uso para manejar las operaciones CRUD de roles y la gestión de permisos asociados. Todos los casos de uso aplicarán la autorización por roles y el filtro multi-tenant.

5.  **Sistema de Autorización Centralizado**: Se introducirá un `AuthorizationService` o `CheckPermissionUseCase` que será el punto central para verificar si un usuario tiene un permiso específico. Todos los casos de uso existentes que actualmente verifican `userRole` directamente se adaptarán para usar este nuevo servicio/caso de uso.

6.  **Modificación de la Gestión de Usuarios**: La página de "Gestión de Usuarios" (Feature 010) se actualizará para que la asignación de roles a usuarios utilice los roles definidos en este nuevo sistema, en lugar de los roles fijos.

7.  **Seguridad y Multi-tenancy Reforzada**:
    *   Todas las Server Actions y Casos de Uso relacionados con la gestión de roles y permisos obtendrán el `organizationId`, `userId` y `userRole` de la sesión de NextAuth.js.
    *   Solo los usuarios con rol `ADMINISTRADOR` (o un rol con el permiso `role.manage`) podrán acceder a esta funcionalidad y realizar acciones.
    *   Todas las consultas y mutaciones a la base de datos se filtrarán estrictamente por `organizationId`.
    *   Se implementarán reglas de negocio específicas (ej. no eliminar roles asignados, no modificar roles de sistema, no quitarse permisos críticos).

## 3. Data Layer

-   **`db/schema.ts` (Nuevas Tablas)**:
    -   **`roles`**:
        -   `id`: `text().primaryKey().$defaultFn(() => createId())`
        -   `name`: `text().notNull()` (ej. "Revisor de Contratos")
        -   `organizationId`: `text().notNull()` (FK a `organizations.id`)
        -   `isSystemRole`: `boolean().default(false).notNull()` (para `OPERADOR`, `ADMINISTRADOR` por defecto)
        -   `createdAt`: `timestamp().defaultNow().notNull()`
        -   `updatedAt`: `timestamp().defaultNow().notNull()`
        -   **Índices**:
            -   `idx_roles_organization_id`: en `organizationId`.
            -   `idx_roles_organization_id_name_unique`: único compuesto en `(organizationId, name)`.
    -   **`permissions`**: (Tabla predefinida, no gestionable por UI)
        -   `id`: `text().primaryKey()` (ej. `document.create`, `user.manage`)
        -   `description`: `text()` (descripción amigable)
    -   **`rolePermissions`**: (Tabla pivote para relación muchos a muchos)
        -   `roleId`: `text().notNull()` (FK a `roles.id`)
        -   `permissionId`: `text().notNull()` (FK a `permissions.id`)
        -   **Clave Primaria Compuesta**: `(roleId, permissionId)`
        -   **Índices**:
            -   `idx_role_permissions_role_id`: en `roleId`.
            -   `idx_role_permissions_permission_id`: en `permissionId`.

-   **`db/schema.ts` (Modificación de Tabla Existente)**:
    -   **`users`**:
        -   La columna `role: text('role')` se eliminará.
        -   Se añadirá `roleId: text('role_id').notNull()` (FK a `roles.id`).
        -   **Índice**: `idx_users_role_id`: en `roleId`.

-   **`IRoleRepository` (`src/modules/roles/core/role.repository.ts`)**:
    -   Se creará una nueva interfaz.
    -   Métodos: `findManyByOrganizationId`, `findById`, `findByName`, `create`, `update`, `delete`, `getPermissionsByRoleId`, `addPermissionsToRole`, `removePermissionsFromRole`, `countUsersWithRole`.
    -   Tipos: `Role`, `RoleInsertData`, `RoleUpdateData`, `Permission`.

-   **`IPermissionRepository` (`src/modules/roles/core/permission.repository.ts`)**:
    -   Se creará una nueva interfaz.
    -   Métodos: `findAll()`.

-   **`DrizzleRoleRepository` (`src/modules/roles/infra/drizzle-role.repository.ts`)**:
    -   Implementará `IRoleRepository`, con lógica Drizzle y multi-tenancy.

-   **`DrizzlePermissionRepository` (`src/modules/roles/infra/drizzle-permission.repository.ts`)**:
    -   Implementará `IPermissionRepository`, devolviendo la lista predefinida de permisos.

## 4. Application Layer

-   **`ListRolesUseCase` (`src/modules/roles/application/list-roles.use-case.ts`)**:
    -   Recibirá `{ organizationId, userId, userRole }`.
    -   **Autorización**: Verificará el permiso `role.view` (o `role.manage`).
    -   Llamará a `roleRepository.findManyByOrganizationId` y `getPermissionsByRoleId` para cada rol.

-   **`CreateRoleUseCase` (`src/modules/roles/application/create-role.use-case.ts`)**:
    -   Recibirá `{ name, permissionIds[], organizationId, actingUserId, actingUserRole }`.
    -   **Autorización**: Verificará el permiso `role.manage`.
    -   **Validación**: Nombre único por organización, permisos válidos.
    -   Llamará a `roleRepository.create` y `addPermissionsToRole`.

-   **`UpdateRoleUseCase` (`src/modules/roles/application/update-role.use-case.ts`)**:
    -   Recibirá `{ id, name?, permissionIds[]?, organizationId, actingUserId, actingUserRole }`.
    -   **Autorización**: Verificará el permiso `role.manage`.
    -   **Reglas de Negocio**:
        -   No permitirá renombrar roles de sistema (`isSystemRole = true`).
        -   No permitirá que un `ADMINISTRADOR` se quite a sí mismo el permiso `role.manage` o `user.manage` de su propio rol.
    -   Llamará a `roleRepository.update`, `addPermissionsToRole`, `removePermissionsFromRole`.

-   **`DeleteRoleUseCase` (`src/modules/roles/application/delete-role.use-case.ts`)**:
    -   Recibirá `{ id, organizationId, actingUserId, actingUserRole }`.
    -   **Autorización**: Verificará el permiso `role.manage`.
    -   **Reglas de Negocio**:
        -   No permitirá eliminar roles de sistema (`isSystemRole = true`).
        -   No permitirá eliminar un rol si está asignado a usuarios (`countUsersWithRole > 0`).
    -   Llamará a `roleRepository.delete`.

-   **`ListAvailablePermissionsUseCase` (`src/modules/roles/application/list-available-permissions.use-case.ts`)**:
    -   Recibirá `{ userId, userRole }`.
    -   **Autorización**: Verificará el permiso `role.view` (o `role.manage`).
    -   Llamará a `permissionRepository.findAll`.

-   **`AuthorizationService` (o `CheckPermissionUseCase`) (`src/core/auth/authorization.service.ts`)**:
    -   Nuevo servicio centralizado para verificar permisos.
    -   Método: `hasPermission(userId: string, organizationId: string, permission: string): Promise<boolean>`.
    -   Obtendrá el rol del usuario y los permisos asociados a ese rol. Podría implementar un caché para optimizar.

-   **Actualización de Casos de Uso Existentes**:
    -   `GetDocumentDetailsUseCase`, `GetDocumentHistoryUseCase`, `ListUsersUseCase`, `CreateUserUseCase`, `UpdateUserUseCase`, `DeleteUserUseCase` se modificarán para inyectar y usar `AuthorizationService.hasPermission()` en lugar de verificar `userRole` directamente.
        -   Ejemplo: `if (!await this.authorizationService.hasPermission(userId, organizationId, 'document.view')) { throw new Error('Forbidden'); }`

## 5. Presentation Layer (UI)

-   **Página de Gestión de Roles (`src/app/admin/roles/page.tsx`)**:
    -   Server Component.
    -   Obtendrá la sesión del usuario (`session`) y verificará el permiso `role.view` (o `role.manage`).
    -   Llamará a Server Actions para `listRoles` y `listAvailablePermissions`.
    -   Renderizará un Client Component `RoleManagementTable`.

-   **Server Actions (`src/app/admin/roles/_actions.ts`)**:
    -   `listRoles()`: Invoca `ListRolesUseCase`.
    -   `createRole(name: string, permissionIds: string[])`: Invoca `CreateRoleUseCase`.
    -   `updateRole(id: string, name?: string, permissionIds?: string[])`: Invoca `UpdateRoleUseCase`.
    -   `deleteRole(id: string)`: Invoca `DeleteRoleUseCase`.
    -   `listAvailablePermissions()`: Invoca `ListAvailablePermissionsUseCase`.
    -   Todas usarán `getSecurityContext()` y manejarán errores.

-   **Componente `RoleManagementTable.tsx` (Client Component)**:
    -   Mostrará una tabla con roles, sus permisos y botones de acción (Crear, Editar, Eliminar).
    -   Gestionará el estado de los modales de CRUD.

-   **Componentes de Formulario/Modal (Client Components)**:
    -   `CreateRoleForm.tsx`: Formulario para nombre del rol y selección de permisos (checkboxes/toggles).
    -   `EditRoleForm.tsx`: Formulario para editar nombre y permisos de un rol.
    -   `DeleteRoleConfirmation.tsx`: Modal de confirmación para eliminar roles.

-   **Actualización de `UserManagementTable.tsx`**:
    -   El `Select` para el rol de usuario se poblará dinámicamente con los roles obtenidos de `ListRolesUseCase` (a través de una Server Action).
    -   La Server Action `updateUser` se modificará para aceptar `roleId` en lugar de `role` string.

## 6. Seguridad y Optimización

-   **Aislamiento Multi-tenant**: Reforzado en todas las capas para roles y permisos.
-   **Autorización por Permisos**: El `AuthorizationService` será el punto de control principal.
-   **Contraseñas**: No directamente afectadas por esta feature, pero se mantiene el hashing.
-   **Optimización de Base de Datos**:
    -   **Tabla `roles`**: Índices en `organizationId` y `(organizationId, name)` (único).
    -   **Tabla `rolePermissions`**: Índices en `roleId` y `permissionId`.
    -   **Tabla `users`**: Índice en `roleId`.
    -   **`AuthorizationService`**: Considerar caching de permisos por rol/usuario para evitar consultas repetitivas a la DB en cada verificación de permiso.

## 7. Tareas de Implementación

-   **Data Layer**:
    -   [ ] Actualizar `db/schema.ts`:
        -   Añadir tablas `roles`, `permissions`, `rolePermissions`.
        -   Modificar tabla `users`: eliminar `role` y añadir `roleId` (FK a `roles.id`).
        -   Añadir índices a las nuevas tablas y a `users.roleId`.
    -   [ ] Crear `IRoleRepository` y tipos (`Role`, `RoleInsertData`, `RoleUpdateData`).
    -   [ ] Crear `IPermissionRepository` y tipo `Permission`.
    -   [ ] Implementar `DrizzleRoleRepository`.
    -   [ ] Implementar `DrizzlePermissionRepository` (con lista hardcodeada de permisos).
    -   [ ] Generar y aplicar migración de Drizzle.
    -   [ ] Crear script de seeding para roles y permisos por defecto (ADMINISTRADOR, OPERADOR y sus permisos iniciales).

-   **Application Layer**:
    -   [ ] Crear `ListRolesUseCase`.
    -   [ ] Crear `CreateRoleUseCase`.
    -   [ ] Crear `UpdateRoleUseCase`.
    -   [ ] Crear `DeleteRoleUseCase`.
    -   [ ] Crear `ListAvailablePermissionsUseCase`.
    -   [ ] Crear `AuthorizationService` (o `CheckPermissionUseCase`).
    -   [ ] Registrar todos los nuevos repositorios y casos de uso en `tsyringe`.
    -   [ ] **Actualizar Casos de Uso Existentes**: Modificar `GetDocumentDetailsUseCase`, `GetDocumentHistoryUseCase`, `ListUsersUseCase`, `CreateUserUseCase`, `UpdateUserUseCase`, `DeleteUserUseCase` para usar `AuthorizationService.hasPermission()` en lugar de `userRole` directo.

-   **Presentation Layer (UI)**:
    -   [ ] Crear la página `src/app/admin/roles/page.tsx` (Server Component).
    -   [ ] Crear las Server Actions CRUD para roles y permisos en `src/app/admin/roles/_actions.ts`.
    -   [ ] Crear el componente `RoleManagementTable.tsx` (Client Component).
    -   [ ] Crear los componentes de formulario/modal (`CreateRoleForm.tsx`, `EditRoleForm.tsx`, `DeleteRoleConfirmation.tsx`).
    -   [ ] **Actualizar `UserManagementTable.tsx`**: Modificar el selector de rol para usar los roles dinámicos y actualizar la Server Action `updateUser` para aceptar `roleId`.
    -   [ ] Añadir navegación a la página de gestión de roles (ej. en un sidebar, solo visible para `ADMINISTRADOR`es).

-   **Tests**:
    -   [ ] Añadir pruebas de integración para `IRoleRepository` y `IPermissionRepository`.
    -   [ ] Añadir pruebas de integración para todos los nuevos casos de uso (`ListRolesUseCase`, `CreateRoleUseCase`, `UpdateRoleUseCase`, `DeleteRoleUseCase`, `ListAvailablePermissionsUseCase`, `AuthorizationService`), verificando autorización, multi-tenancy y reglas de negocio.
    -   [ ] Añadir pruebas de integración para las Server Actions de roles.
    -   [ ] Añadir pruebas de componente para `RoleManagementTable.tsx` y los formularios/modales.
    -   [ ] **Actualizar Pruebas Existentes**: Modificar las pruebas de integración de los casos de uso existentes (`GetDocumentDetailsUseCase`, `GetDocumentHistoryUseCase`, `ListUsersUseCase`, `CreateUserUseCase`, `UpdateUserUseCase`, `DeleteUserUseCase`) para reflejar el nuevo sistema de permisos.

## 8. Verificación Final

-   [ ] `pnpm typecheck` pasa sin errores.
-   [ ] `pnpm exec vitest run` pasa con todos los tests ejecutados.
-   [ ] `pnpm build` se completa limpiamente.
-   [ ] **Prueba E2E Manual (ADMIN)**:
    -   Iniciar sesión como `ADMINISTRADOR`.
    -   Navegar a la página de gestión de roles.
    -   Verificar listado de roles (incluyendo los de sistema).
    -   Crear un nuevo rol personalizado con permisos específicos.
    -   Editar un rol (cambiar nombre, añadir/quitar permisos).
    -   Intentar renombrar un rol de sistema.
    -   Eliminar un rol personalizado (que no esté asignado a usuarios).
    -   Intentar eliminar un rol de sistema.
    -   Intentar eliminar un rol asignado a usuarios.
    -   Navegar a la gestión de usuarios y verificar que el selector de rol muestra los roles personalizados.
    -   Asignar un rol personalizado a un usuario.
    -   Intentar quitarse a sí mismo permisos críticos (`role.manage`, `user.manage`) de su propio rol `ADMINISTRADOR`.
-   [ ] **Prueba E2E Manual (OPERADOR)**:
    -   Iniciar sesión como `OPERADOR`.
    -   Intentar acceder a la página de gestión de roles. Verificar denegación de acceso.
    -   Verificar que las funcionalidades existentes (ej. crear documento, ver historial) funcionan según los permisos de su rol (por defecto).
-   [ ] **Prueba E2E Manual (Usuario con Rol Personalizado)**:
    -   Crear un usuario y asignarle un rol personalizado con permisos limitados (ej. solo `document.view.all`).
    -   Iniciar sesión con ese usuario.
    -   Verificar que solo puede realizar las acciones permitidas por su rol y que las acciones no permitidas son denegadas.
-   [ ] **Verificación de Seguridad (Multi-tenancy)**:
    -   Iniciar sesión como `ADMINISTRADOR` de la `OrgA`.
    -   Intentar manipular la URL o los datos para gestionar roles/permisos de la `OrgB`.
    -   Verificar que todas las acciones son denegadas.