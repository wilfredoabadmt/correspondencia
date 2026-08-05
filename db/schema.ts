import { createId } from '@paralleldrive/cuid2';
import { pgTable, text, timestamp, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { index, uniqueIndex, foreignKey, primaryKey } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['OPERADOR', 'ADMINISTRADOR', 'SUPERADMIN']);

export const organizations = pgTable('organizations', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name'),
    code: text('code'),
});

export const users = pgTable('users', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name'),
    email: text('email'),
    organizationId: text('organization_id'),
    role: text('role').default('OPERADOR'),
    roleId: text('role_id'),
    hashedPassword: text('hashed_password'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        organizationIdEmailIdx: uniqueIndex('idx_users_organization_id_email').on(table.organizationId, table.email),
        organizationIdIdx: index('idx_users_organization_id').on(table.organizationId),
        roleIdIdx: index('idx_users_role_id').on(table.roleId),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
        roleFk: foreignKey({
            columns: [table.roleId],
            foreignColumns: [roles.id],
        }).onDelete('restrict'),
    };
});

export const roles = pgTable('roles', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    organizationId: text('organization_id').notNull(),
    isSystemRole: boolean('is_system_role').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        organizationIdIdx: index('idx_roles_organization_id').on(table.organizationId),
        organizationIdNameUniqueIdx: uniqueIndex('idx_roles_organization_id_name').on(table.organizationId, table.name),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
    };
});

export const permissions = pgTable('permissions', {
    id: text('id').primaryKey(),
    description: text('description'),
});

export const rolePermissions = pgTable('role_permissions', {
    roleId: text('role_id').notNull(),
    permissionId: text('permission_id').notNull(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
        roleFk: foreignKey({
            columns: [table.roleId],
            foreignColumns: [roles.id],
        }).onDelete('cascade'),
        permissionFk: foreignKey({
            columns: [table.permissionId],
            foreignColumns: [permissions.id],
        }).onDelete('cascade'),
    };
});

export const areaHierarchy = pgTable('area_hierarchy', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    code: text('code').notNull(),
    organizationId: text('organization_id').notNull(),
    parentId: text('parent_id'),
    level: integer('level').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        organizationIdIdx: index('idx_area_hierarchy_organization_id').on(table.organizationId),
        parentIdIdx: index('idx_area_hierarchy_parent_id').on(table.parentId),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
        parentFk: foreignKey({
            columns: [table.parentId],
            foreignColumns: [table.id],
        }).onDelete('restrict'),
    };
});

export const areaHierarchies = areaHierarchy;

export const documentSequences = pgTable('document_sequences', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    sequence: integer('sequence').default(0),
});

export const documentTypes = pgTable('document_types', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name'),
});

export const expedientes = pgTable('expedientes', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    code: text('code').notNull(), // Ej. EXP-2026-0001
    subject: text('subject').notNull(),
    status: text('status').default('Abierto').notNull(), // Posibles valores: 'Abierto', 'Cerrado', 'Archivado'
    organizationId: text('organization_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        organizationIdIdx: index('idx_expedientes_organization_id').on(table.organizationId),
        codeOrgIdUniqueIdx: uniqueIndex('idx_expedientes_code_org_id').on(table.code, table.organizationId),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
    };
});

export const documents = pgTable('documents', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    trackingId: text('tracking_id'),
    trackingCode: text('tracking_code'),
    subject: text('subject'),
    sender: text('sender'),
    status: text('status'),
    organizationId: text('organization_id'),
    receptionDate: timestamp('reception_date'),
    documentType: text('document_type'),
    destinationAreaId: text('destination_area_id'),
    areaHierarchyId: text('area_hierarchy_id'),
    currentUserId: text('current_user_id'),
    groupedIntoDocumentId: text('grouped_into_document_id'),
    folderCategory: text('folder_category'),
    archiveObservations: text('archive_observations'),
    fileKey: text('file_key'),
    downloadUrl: text('download_url'),
    expedienteId: text('expediente_id'),
    isSigned: boolean('is_signed').default(false),
    signedAt: timestamp('signed_at'),
    signedByUserId: text('signed_by_user_id'),
    signatureHash: text('signature_hash'),
    verificationCode: text('verification_code'),
    isExternal: boolean('is_external').default(false).notNull(),
    applicantIdentityDocument: text('applicant_identity_document'),
    applicantName: text('applicant_name'),
    applicantInstitution: text('applicant_institution'),
    applicantPhone: text('applicant_phone'),
    applicantEmail: text('applicant_email'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        organizationIdIdx: index('idx_documents_organization_id').on(table.organizationId),
        trackingIdIdx: index('idx_documents_tracking_id').on(table.trackingId),
        verificationCodeUniqueIdx: uniqueIndex('idx_documents_verification_code').on(table.verificationCode),
        destinationAreaFk: foreignKey({
            columns: [table.destinationAreaId],
            foreignColumns: [areaHierarchy.id],
        }).onDelete('restrict'),
        areaHierarchyFk: foreignKey({
            columns: [table.areaHierarchyId],
            foreignColumns: [areaHierarchy.id],
        }).onDelete('restrict'),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
        expedienteIdIdx: index('idx_documents_expediente_id').on(table.expedienteId),
        expedienteFk: foreignKey({
            columns: [table.expedienteId],
            foreignColumns: [expedientes.id],
        }).onDelete('set null'),
        signedByUserFk: foreignKey({
            columns: [table.signedByUserId],
            foreignColumns: [users.id],
        }).onDelete('set null'),
    };
});

export const documentHistory = pgTable('document_history', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    documentId: text('document_id').notNull(),
    fromAreaId: text('from_area_id'),
    toAreaId: text('to_area_id').notNull(),
    fromUserId: text('from_user_id'),
    toUserId: text('to_user_id'),
    userId: text('user_id').notNull(),
    action: text('action'),
    receptionStatus: text('reception_status'),
    receivedAt: timestamp('received_at'),
    rejectionReason: text('rejection_reason'),
    justificationReason: text('justification_reason'),
    comment: text('comment'),
    derivationType: text('derivation_type'),
    instructionCode: text('instruction_code'),
    isUrgent: boolean('is_urgent').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        documentIdIdx: index('idx_document_history_document_id').on(table.documentId),
        userIdIdx: index('idx_document_history_user_id').on(table.userId),
        documentFk: foreignKey({
            columns: [table.documentId],
            foreignColumns: [documents.id],
        }).onDelete('cascade'),
        fromAreaFk: foreignKey({
            columns: [table.fromAreaId],
            foreignColumns: [areaHierarchy.id],
        }).onDelete('set null'),
        toAreaFk: foreignKey({
            columns: [table.toAreaId],
            foreignColumns: [areaHierarchy.id],
        }).onDelete('restrict'),
        userFk: foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
        }).onDelete('restrict'),
    };
});

export const favoriteRecipients = pgTable('favorite_recipients', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull(),
    targetAreaId: text('target_area_id').notNull(),
    organizationId: text('organization_id').notNull(),
    alias: text('alias'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        userFk: foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
        }).onDelete('cascade'),
        targetAreaFk: foreignKey({
            columns: [table.targetAreaId],
            foreignColumns: [areaHierarchy.id],
        }).onDelete('cascade'),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
    };
});

export const citeConfigs = pgTable('cite_configs', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    organizationId: text('organization_id').notNull(),
    areaId: text('area_id'),
    documentType: text('document_type'),
    formatPattern: text('format_pattern').notNull(),
    currentSequence: integer('current_sequence').default(0).notNull(),
    year: integer('year').notNull(),
    resetYearly: boolean('reset_yearly').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        organizationIdIdx: index('idx_cite_configs_organization_id').on(table.organizationId),
        organizationFk: foreignKey({
            columns: [table.organizationId],
            foreignColumns: [organizations.id],
        }).onDelete('cascade'),
        areaFk: foreignKey({
            columns: [table.areaId],
            foreignColumns: [areaHierarchy.id],
        }).onDelete('set null'),
    };
});