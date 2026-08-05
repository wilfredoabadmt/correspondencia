# Plan Técnico: Feature 021 - Proveídos Tipificados y Derivación Multidestino (Original / Copia)

## 1. Modificaciones en la Base de Datos (`db/schema.ts`)

1. Crear la tabla `proveido_catalog`:
```typescript
export const proveidoCatalog = pgTable('proveido_catalog', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    organizationId: text('organization_id').notNull(),
    code: text('code').notNull(),
    description: text('description').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

2. Añadir campos en `document_history`:
   - `derivationType`: `OFICIAL` (Original) | `COPIA` (Copia).
   - `instructionCode`: Código de proveído tipificado.

---

## 2. Componentes Backend y Casos de Uso

- `src/modules/gestion-documental/core/proveido-catalog.repository.ts` — Interfaz del catálogo de proveídos.
- `src/modules/gestion-documental/infra/drizzle-proveido-catalog.repository.ts` — Repositorio Drizzle.
- `src/modules/gestion-documental/application/derive-multidestination-document.use-case.ts` — Servicio de aplicación para procesar derivaciones simultáneas (1 Original + N Copias).
- `src/modules/gestion-documental/application/list-proveidos.use-case.ts` — Obtener catálogo de proveídos institucionales.

---

## 3. Interfaces de Usuario (UI Frontend)

- Actualización en `DeriveDocumentForm` (`src/components/document/derive-document-form.tsx`):
  - Checkboxes para seleccionar Proveídos Tipificados.
  - Selector multiselect para añadir Áreas en Copia Informativa.
- Badge distintivo (`ORIGINAL` vs `COPIA`) en las bandejas (`/inbox/incoming`, `/inbox/pending`, `/documents`).
- API Endpoints:
  - `POST /api/documents/[documentId]/derive-multidestination`
  - `GET /api/admin/proveidos`
