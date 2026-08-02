# Tareas: 011 - Gestión de Roles y Permisos Granulares

## 1. Data Layer

- [ ] **Actualizar `db/schema.ts`**:
    - [ ] Añadir tablas `roles`, `permissions`, `rolePermissions`.
    - [ ] Modificar tabla `users`: eliminar `role` y añadir `roleId` (FK a `roles.id`).
    - [ ] Añadir índices a las nuevas tablas y a `users.roleId`.
- [ ] Crear `IRoleRepository` y tipos (`Role`, `RoleInsertData`, `RoleUpdateData`).
- [x] Crear `IPermissionRepository` y tipo `Permission`.
- [ ] Implementar `DrizzleRoleRepository`.
- [x] Implementar `DrizzlePermissionRepository` (con lista hardcodeada de permisos).
- [x] Generar y aplicar migración de Drizzle.
- [ ] Crear script de seeding para roles y permisos por defecto (ADMINISTRADOR, OPERADOR y sus permisos iniciales).
- [x] Crear script de seeding para roles y permisos por defecto (ADMINISTRADOR, OPERADOR y sus permisos iniciales).
 
## 2. Application Layer
- [x] Crear `ListRolesUseCase`.
- [x] Crear `CreateRoleUseCase`.
- [x] Crear `UpdateRoleUseCase`.
- [x] Crear `DeleteRoleUseCase`.
- [x] Crear `ListAvailablePermissionsUseCase`.
- [ ] Crear `AuthorizationService` (o `CheckPermissionUseCase`).
- [ ] Registrar todos los nuevos repositorios y casos de uso en `tsyringe`.
- [ ] **Actualizar Casos de Uso Existentes**: Modificar `GetDocumentDetailsUseCase`, `GetDocumentHistoryUseCase`, `ListUsersUseCase`, `CreateUserUseCase`, `UpdateUserUseCase`, `DeleteUserUseCase` para usar `AuthorizationService.hasPermission()` en lugar de `userRole` directo.

## 3. Presentation Layer (UI)

- [ ] Crear la página `src/app/admin/roles/page.tsx` (Server Component).
- [ ] Crear las Server Actions CRUD para roles y permisos en `src/app/admin/roles/_actions.ts`.
- [ ] Crear el componente `RoleManagementTable.tsx` (Client Component).
- [ ] Crear los componentes de formulario/modal (`CreateRoleForm.tsx`, `EditRoleForm.tsx`, `DeleteRoleConfirmation.tsx`).
- [ ] **Actualizar `UserManagementTable.tsx`**: Modificar el selector de rol para usar los roles dinámicos y actualizar la Server Action `updateUser` para aceptar `roleId`.
- [ ] Añadir navegación a la página de gestión de roles (ej. en un sidebar, solo visible para `ADMINISTRADOR`es).

## 4. Pruebas (Tests)
- [x] Añadir pruebas de integración para `IRoleRepository` y `IPermissionRepository`.
- [ ] Añadir pruebas de integración para todos los nuevos casos de uso (`ListRolesUseCase`, `CreateRoleUseCase`, `UpdateRoleUseCase`, `DeleteRoleUseCase`, `ListAvailablePermissionsUseCase`, `AuthorizationService`), verificando autorización, multi-tenancy y reglas de negocio.
- [ ] Añadir pruebas de integración para las Server Actions de roles.
- [ ] Añadir pruebas de componente para `RoleManagementTable.tsx` y los formularios/modales.
- [ ] **Actualizar Pruebas Existentes**: Modificar las pruebas de integración de los casos de uso existentes (`GetDocumentDetailsUseCase`, `GetDocumentHistoryUseCase`, `ListUsersUseCase`, `CreateUserUseCase`, `UpdateUserUseCase`, `DeleteUserUseCase`) para reflejar el nuevo sistema de permisos.

## 5. Verificación Final

- [ ] `pnpm typecheck` pasa sin errores.
- [ ] `pnpm exec vitest run` pasa con todos los tests ejecutados.
- [ ] `pnpm build` se completa limpiamente.
- [ ] **Prueba E2E Manual (ADMIN)**: Realizar las verificaciones detalladas en el `plan.md`.
- [ ] **Prueba E2E Manual (OPERADOR)**: Realizar las verificaciones detalladas en el `plan.md`.
- [ ] **Prueba E2E Manual (Usuario con Rol Personalizado)**: Realizar las verificaciones detalladas en el `plan.md`.
- [ ] **Verificación de Seguridad (Multi-tenancy)**: Realizar las verificaciones detalladas en el `plan.md`.