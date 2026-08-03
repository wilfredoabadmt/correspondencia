# Investigaciones y Decisiones Técnicas: Feature 016 - Perfil de Usuario y Destinatarios Frecuentes

## 1. Cambio Seguro de Contraseña

### Decisión
Utilizar `bcryptjs` (ya disponible en el proyecto) para verificar la contraseña actual del usuario antes de hashear e igualar la nueva contraseña.

- **Validaciones**:
  - Contraseña actual correcta (coincidencia con hash guardado).
  - Nueva contraseña de mínimo 8 caracteres con variedad de caracteres.
  - Nueva contraseña diferente de la contraseña actual.

---

## 2. Persistencia de Destinatarios Frecuentes

### Decisión
Agregar una nueva tabla en `db/schema.ts` llamada `favorite_recipients`:

```typescript
export const favoriteRecipients = pgTable('favorite_recipients', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    targetAreaId: text('target_area_id').notNull().references(() => areaHierarchies.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id').notNull(),
    alias: text('alias'), // Nombre corto opcional
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 3. Integración en Formulario de Derivación

### Decisión
Modificar el formulario de derivación `<DeriveDocumentForm />` para consultar los destinatarios frecuentes del usuario y mostrarlos en una sección superior **"⭐ Frecuentes"** con botones de un solo clic para autoseleccionar el área de destino.
