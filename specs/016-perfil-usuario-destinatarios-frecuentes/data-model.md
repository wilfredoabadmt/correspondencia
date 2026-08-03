# Modelo de Datos y Esquema: Feature 016

## 1. Tabla de Base de Datos (`favorite_recipients`)

```typescript
export const favoriteRecipients = pgTable('favorite_recipients', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    targetAreaId: text('target_area_id').notNull().references(() => areaHierarchies.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id').notNull(),
    alias: text('alias'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 2. DTOs de Aplicación

### UpdateUserProfileDTO
```typescript
export interface UpdateUserProfileDTO {
    userId: string;
    organizationId: string;
    name: string;
    email: string;
}
```

### ChangePasswordDTO
```typescript
export interface ChangePasswordDTO {
    userId: string;
    organizationId: string;
    currentPassword: string;
    newPassword: string;
}
```

### FavoriteRecipientDTO
```typescript
export interface FavoriteRecipientItem {
    id: string;
    targetAreaId: string;
    targetAreaName: string;
    alias?: string | null;
}
```
