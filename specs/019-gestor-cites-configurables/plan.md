# Plan Técnico: Feature 019 - Gestor de CITEs Automáticos Configurables

## 1. Modificaciones en la Base de Datos (`db/schema.ts`)

Crear la tabla `cite_configs`:
```typescript
export const citeConfigs = pgTable('cite_configs', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    organizationId: text('organization_id').notNull(),
    areaId: text('area_id'), // Nulo si aplica a nivel organizacional
    documentType: text('document_type'), // Nulo si aplica a todos los tipos
    formatPattern: text('format_pattern').notNull(), // Ej: "{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO:4}/{AÑO}"
    currentSequence: integer('current_sequence').default(0).notNull(),
    year: integer('year').notNull(),
    resetYearly: boolean('reset_yearly').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        organizationIdIdx: index('idx_cite_configs_organization_id').on(table.organizationId),
        uniqueConfigIdx: uniqueIndex('idx_cite_configs_org_area_type_year').on(
            table.organizationId,
            table.areaId,
            table.documentType,
            table.year
        ),
    };
});
```

---

## 2. Componentes Backend y Casos de Uso

- `src/modules/gestion-documental/core/cite-config.repository.ts` — Interfaz de repositorio.
- `src/modules/gestion-documental/infra/drizzle-cite-config.repository.ts` — Implementación Drizzle con incremento atómico de secuencia.
- `src/modules/gestion-documental/application/generate-next-cite.use-case.ts` — Generador atómico de CITE por patrón y año.
- `src/modules/gestion-documental/application/manage-cite-configs.use-case.ts` — CRUD de configuraciones.

---

## 3. Endpoints de API y Componentes Frontend

- `GET /api/admin/cites` — Listar reglas de CITE.
- `POST /api/admin/cites` — Crear o actualizar regla de CITE.
- `src/app/admin/cites/page.tsx` — Vista administrativa de CITEs.
- Actualización en `RegisterDocumentUseCase` para invocar la generación automática de CITE si la opción está habilitada.
