# Plan Técnico: Feature 023 - Gestión Multi-Rol de Usuarios y Cargos Institucionales por Área

## 1. Modificaciones en el Esquema Drizzle (`db/schema.ts`)

1. Añadir columna `jobTitle` en `users`:
   - `jobTitle`: `text('job_title')` (Ej. *Director de Tecnologías*, *Analista de Sistemas*)
2. Crear tabla `user_roles` para asignación N:M de roles por usuario:
```typescript
export const userRoles = pgTable('user_roles', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull(),
    roleId: text('role_id').notNull(),
    organizationId: text('organization_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 2. Servicios de Aplicación Backend

- `src/modules/users/core/user-role-assignment.repository.ts` — Interfaz para la gestión de roles múltiples.
- `src/modules/users/infra/drizzle-user-role-assignment.repository.ts` — Implementación Drizzle.
- `src/modules/users/application/assign-user-roles.use-case.ts` — Asignar lista de roles e ingresar cargo oficial (`jobTitle`).

---

## 3. Interfaces de Usuario (UI Frontend)

- Actualización del Modal de Gestión de Usuarios en `/admin/users`:
  - Checkbox multi-select de roles.
  - Campo de texto para `Cargo Institucional (jobTitle)`.
- API Endpoint: `POST /api/users/[id]/multi-roles`.
