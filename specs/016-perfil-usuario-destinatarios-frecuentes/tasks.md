# Tareas: 016 - Perfil de Usuario, Destinatarios Frecuentes y Cambio de Contraseña

## 1. Fase 1: Setup y Esquema de Base de Datos

- [x] T001 Actualizar `db/schema.ts` añadiendo la tabla `favoriteRecipients` y sus relaciones.
- [x] T002 Generar y aplicar migración Drizzle mediante `pnpm db:generate` y `pnpm db:migrate`.

## 2. Fase 2: Capa de Datos y Repositorios (Foundational Layer)

- [x] T003 Crear interfaz de repositorio `IFavoriteRecipientsRepository` en `src/modules/users/core/favorite-recipients.repository.ts`.
- [x] T004 Implementar `DrizzleFavoriteRecipientsRepository` en `src/modules/users/infra/drizzle-favorite-recipients.repository.ts`.
- [x] T005 Registrar el repositorio en la inyección de dependencias `src/core/container.ts` e `src/core/injection-tokens.ts`.

## 3. Fase 3: User Story 1 (US1) - Vista de Perfil y Cambio Seguro de Contraseña (P1)

- [x] T006 [P] [US1] Crear el caso de uso `ChangePasswordUseCase` en `src/modules/users/application/change-password.use-case.ts`.
- [x] T007 [P] [US1] Crear las pruebas unitarias para `ChangePasswordUseCase` en `src/modules/users/application/change-password.use-case.test.ts`.
- [x] T008 [US1] Crear las Server Actions para actualizar datos personales y cambiar contraseña en `src/app/profile/_actions.ts`.
- [x] T009 [US1] Crear la vista del **Perfil de Usuario** en `src/app/profile/page.tsx`.

## 4. Fase 4: User Story 2 (US2) - Gestión de Destinatarios Frecuentes (P1)

- [x] T010 [P] [US2] Crear el caso de uso `ManageFavoritesUseCase` en `src/modules/users/application/manage-favorites.use-case.ts`.
- [x] T011 [P] [US2] Crear las pruebas unitarias para `ManageFavoritesUseCase` en `src/modules/users/application/manage-favorites.use-case.test.ts`.
- [x] T012 [US2] Integrar el componente de selección de **Destinatarios Frecuentes** en la página de Perfil `src/app/profile/page.tsx`.

## 5. Fase 5: User Story 3 (US3) - Accesos Rápida a Frecuentes en Derivaciones (P2)

- [x] T013 [US3] Actualizar el formulario de derivación en `src/components/document/derive-document-form.tsx` para desplegar el bloque de accesos rápidos a **⭐ Frecuentes**.
- [x] T014 [US3] Agregar acceso directo al Perfil en la barra de navegación lateral en `src/components/layout/sidebar.tsx`.

## 6. Fase 6: Polishing y Quality Gate

- [x] T015 Ejecutar validación `pnpm typecheck` asegurando cero errores de compilación.
- [x] T016 Ejecutar suite de pruebas completa `pnpm exec vitest run` verificando que todos los tests pasen limpiamente.
- [x] T017 Verificar escenarios manuales E2E de perfil y frecuentes descritos en `quickstart.md`.
