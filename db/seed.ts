import { createId } from '@paralleldrive/cuid2';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import type { Permission } from '~/modules/roles/core/permission.repository'; // Importar el tipo Permission

// Cargar variables de entorno
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env.local');
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

// --- Lista de Permisos (debe coincidir con DrizzlePermissionRepository) ---
const PERMISSIONS_LIST: Permission[] = [
    // Permisos relacionados con Documentos
    { id: 'document.create', description: 'Crear nuevos documentos' },
    { id: 'document.view.all', description: 'Ver todos los documentos de la organización' },
    { id: 'document.view.own', description: 'Ver solo documentos propios' },
    { id: 'document.edit.all', description: 'Editar cualquier documento de la organización' },
    { id: 'document.edit.own', description: 'Editar solo documentos propios' },
    { id: 'document.derive', description: 'Derivar documentos a otras áreas' },
    { id: 'document.approve', description: 'Aprobar documentos' },
    { id: 'document.reject', description: 'Rechazar documentos' },
    { id: 'document.delete', description: 'Eliminar documentos' },

    // Permisos relacionados con Usuarios
    { id: 'user.manage', description: 'Gestionar usuarios (crear, editar, eliminar)' },
    { id: 'user.view', description: 'Ver lista de usuarios' },

    // Permisos relacionados con Áreas
    { id: 'area.manage', description: 'Gestionar áreas (crear, editar, eliminar)' },
    { id: 'area.view', description: 'Ver lista de áreas' },

    // Permisos relacionados con Roles y Permisos
    { id: 'role.manage', description: 'Gestionar roles y permisos (crear, editar, eliminar roles)' },
    { id: 'role.view', description: 'Ver lista de roles y sus permisos' },

    // Permisos generales o de configuración
    { id: 'organization.settings.manage', description: 'Gestionar la configuración de la organización' },
];

// --- Definición de Permisos por Rol por Defecto ---
const ALL_PERMISSION_IDS = PERMISSIONS_LIST.map(p => p.id);
const OPERATOR_PERMISSION_IDS = [
    'document.create',
    'document.view.own',
    'document.edit.own',
    'document.derive',
    'area.view',
    'user.view',
];

async function seed() {
    console.log('🌱 Iniciando seeding de datos...');

    // --- Limpiar datos existentes (opcional, pero útil para seeding repetible) ---
    console.log('🗑️ Limpiando tablas existentes...');
    await db.delete(schema.documentHistory);
    await db.delete(schema.documents);
    await db.delete(schema.areaHierarchy);
    await db.delete(schema.users);
    await db.delete(schema.rolePermissions); // Limpiar antes de roles
    await db.delete(schema.roles); // Limpiar antes de organizaciones
    await db.delete(schema.permissions); // Limpiar antes de organizaciones
    await db.delete(schema.documents);
    await db.delete(schema.areaHierarchy);
    await db.delete(schema.users);
    await db.delete(schema.organizations);
    await db.delete(schema.documentSequences);
    console.log('🗑️ Tablas limpiadas.');

    // --- Generar Permisos ---
    await db.insert(schema.permissions).values(PERMISSIONS_LIST);
    console.log(`🔑 Creados ${PERMISSIONS_LIST.length} permisos.`);

    // --- Generar Organizaciones ---
    const org1Id = createId();
    const org2Id = createId();
    const org3Id = createId(); // Para probar aislamiento

    const [org1, org2, org3] = await db.insert(schema.organizations).values([
        { id: org1Id, name: 'Organización A', code: 'ORGA' },
        { id: org2Id, name: 'Organización B', code: 'ORGB' },
        { id: org3Id, name: 'Organización C', code: 'ORGC' },
    ]).returning();
    console.log(`🏢 Creadas ${[org1, org2, org3].length} organizaciones.`);

    // --- Generar Roles por Defecto para cada Organización ---
    const rolesToInsert: Array<{ id: string; name: string; organizationId: string; isSystemRole: boolean }> = [];
    const rolePermissionsToInsert: Array<{ roleId: string; permissionId: string }> = [];

    // Org 1 Roles
    const adminRoleOrg1Id = createId();
    const operatorRoleOrg1Id = createId();
    rolesToInsert.push({ id: adminRoleOrg1Id, name: 'ADMINISTRADOR', organizationId: org1.id, isSystemRole: true });
    rolesToInsert.push({ id: operatorRoleOrg1Id, name: 'OPERADOR', organizationId: org1.id, isSystemRole: true });
    ALL_PERMISSION_IDS.forEach(pId => rolePermissionsToInsert.push({ roleId: adminRoleOrg1Id, permissionId: pId }));
    OPERATOR_PERMISSION_IDS.forEach(pId => rolePermissionsToInsert.push({ roleId: operatorRoleOrg1Id, permissionId: pId }));

    // Org 2 Roles
    const adminRoleOrg2Id = createId();
    const operatorRoleOrg2Id = createId();
    rolesToInsert.push({ id: adminRoleOrg2Id, name: 'ADMINISTRADOR', organizationId: org2.id, isSystemRole: true });
    rolesToInsert.push({ id: operatorRoleOrg2Id, name: 'OPERADOR', organizationId: org2.id, isSystemRole: true });
    ALL_PERMISSION_IDS.forEach(pId => rolePermissionsToInsert.push({ roleId: adminRoleOrg2Id, permissionId: pId }));
    OPERATOR_PERMISSION_IDS.forEach(pId => rolePermissionsToInsert.push({ roleId: operatorRoleOrg2Id, permissionId: pId }));

    // Org 3 Roles
    const adminRoleOrg3Id = createId();
    rolesToInsert.push({ id: adminRoleOrg3Id, name: 'ADMINISTRADOR', organizationId: org3.id, isSystemRole: true });
    ALL_PERMISSION_IDS.forEach(pId => rolePermissionsToInsert.push({ roleId: adminRoleOrg3Id, permissionId: pId }));

    await db.insert(schema.roles).values(rolesToInsert);
    await db.insert(schema.rolePermissions).values(rolePermissionsToInsert);
    console.log(`🎭 Creados ${rolesToInsert.length} roles y ${rolePermissionsToInsert.length} asociaciones de permisos.`);

    // --- Generar Usuarios ---
    const user1Org1Id = createId(); // Admin Org A
    const user2Org1Id = createId(); // Operador Org A
    const user3Org1Id = createId(); // Operador Org A
    const user1Org2Id = createId(); // Admin Org B
    const user2Org2Id = createId(); // Operador Org B
    const user1Org3Id = createId(); // Admin Org C

    const users = await db.insert(schema.users).values([
        {
            id: user1Org1Id,
            name: 'Admin A',
            email: 'adminA@example.com',
            organizationId: org1.id,
            roleId: adminRoleOrg1Id,
            hashedPassword: 'hashed_password_placeholder',
        },
        {
            id: user2Org1Id,
            name: 'Operador A1',
            email: 'opA1@example.com',
            organizationId: org1.id,
            roleId: operatorRoleOrg1Id,
            hashedPassword: 'hashed_password_placeholder',
        },
        {
            id: user3Org1Id,
            name: 'Operador A2',
            email: 'opA2@example.com',
            organizationId: org1.id,
            roleId: operatorRoleOrg1Id,
            hashedPassword: 'hashed_password_placeholder',
        },
        {
            id: user1Org2Id,
            name: 'Admin B',
            email: 'adminB@example.com',
            organizationId: org2.id,
            roleId: adminRoleOrg2Id,
            hashedPassword: 'hashed_password_placeholder',
        },
        {
            id: user2Org2Id,
            name: 'Operador B1',
            email: 'opB1@example.com',
            organizationId: org2.id,
            roleId: operatorRoleOrg2Id,
            hashedPassword: 'hashed_password_placeholder',
        },
        {
            id: user1Org3Id,
            name: 'Admin C',
            email: 'adminC@example.com',
            organizationId: org3.id,
            roleId: adminRoleOrg3Id,
            hashedPassword: 'hashed_password_placeholder',
        },
    ]).returning();
    console.log(`🧑‍💻 Creados ${users.length} usuarios.`);

    // --- Generar Áreas ---
    const area1Org1Id = createId(); // Org A
    const area2Org1Id = createId(); // Org A
    const area3Org1Id = createId(); // Org A
    const area1Org2Id = createId(); // Org B
    const area2Org2Id = createId(); // Org B

    const areas = await db.insert(schema.areaHierarchy).values([
        { id: area1Org1Id, name: 'Gerencia General A', code: 'GGA', organizationId: org1.id },
        { id: area2Org1Id, name: 'Contabilidad A', code: 'CA', organizationId: org1.id },
        { id: area3Org1Id, name: 'Recursos Humanos A', code: 'RHA', organizationId: org1.id },
        { id: area1Org2Id, name: 'Gerencia General B', code: 'GGB', organizationId: org2.id },
        { id: area2Org2Id, name: 'Ventas B', code: 'VB', organizationId: org2.id },
        { id: createId(), name: 'Marketing C', code: 'MC', organizationId: org3.id },
    ]).returning();
    console.log(`🏢 Creadas ${areas.length} áreas.`);

    // --- Generar Documentos ---
    const doc1Org1Id = createId(); // Documento con mucho historial
    const doc2Org1Id = createId(); // Documento con poco historial
    const doc3Org1Id = createId(); // Documento sin historial
    const doc1Org2Id = createId(); // Documento Org B

    const documents = await db.insert(schema.documents).values([
        {
            id: doc1Org1Id,
            organizationId: org1.id,
            trackingId: 'DOC-ORGA-001',
            trackingCode: 'ORGA-2023-001',
            subject: 'Solicitud de presupuesto anual',
            sender: 'Proveedor X',
            documentType: 'Solicitud',
            destinationAreaId: area1Org1Id,
            areaHierarchyId: area1Org1Id,
            receptionDate: new Date(),
            status: 'En Proceso',
            fileKey: 'file-key-1',
            downloadUrl: 'http://example.com/doc1.pdf',
        },
        {
            id: doc2Org1Id,
            organizationId: org1.id,
            trackingId: 'DOC-ORGA-002',
            trackingCode: 'ORGA-2023-002',
            subject: 'Informe mensual de ventas',
            sender: 'Departamento de Ventas',
            documentType: 'Informe',
            destinationAreaId: area2Org1Id,
            areaHierarchyId: area2Org1Id,
            receptionDate: new Date(),
            status: 'Recibido',
            fileKey: 'file-key-2',
            downloadUrl: 'http://example.com/doc2.pdf',
        },
        {
            id: doc3Org1Id,
            organizationId: org1.id,
            trackingId: 'DOC-ORGA-003',
            trackingCode: 'ORGA-2023-003',
            subject: 'Nuevo contrato de servicio',
            sender: 'Legal',
            documentType: 'Contrato',
            destinationAreaId: area3Org1Id,
            areaHierarchyId: area3Org1Id,
            receptionDate: new Date(),
            status: 'Recibido',
            fileKey: null,
            downloadUrl: null,
        },
        {
            id: doc1Org2Id,
            organizationId: org2.id,
            trackingId: 'DOC-ORGB-001',
            trackingCode: 'ORGB-2023-001',
            subject: 'Reunión de estrategia',
            sender: 'CEO',
            documentType: 'Memorándum',
            destinationAreaId: area1Org2Id,
            areaHierarchyId: area1Org2Id,
            receptionDate: new Date(),
            status: 'En Proceso',
            fileKey: 'file-key-3',
            downloadUrl: 'http://example.com/doc3.pdf',
        },
        {
            id: createId(),
            organizationId: org3.id,
            trackingId: 'DOC-ORGC-001',
            trackingCode: 'ORGC-2023-001',
            subject: 'Documento de Org C',
            sender: 'Externo',
            documentType: 'Carta',
            destinationAreaId: areas.find(a => a.organizationId === org3Id)!.id,
            areaHierarchyId: areas.find(a => a.organizationId === org3Id)!.id,
            receptionDate: new Date(),
            status: 'Recibido',
            fileKey: null,
            downloadUrl: null,
        },
    ]).returning();
    console.log(`📄 Creados ${documents.length} documentos.`);

    // --- Generar Historial para doc1Org1Id (muchos eventos para paginación) ---
    const historyEntries = [];
    for (let i = 0; i < 25; i++) { // 25 eventos para probar paginación (limit=10)
        const fromArea = i === 0 ? null : (i % 2 === 0 ? area1Org1Id : area2Org1Id);
        const toArea = i % 2 === 0 ? area2Org1Id : area1Org1Id;
        const user = i % 2 === 0 ? user2Org1Id : user3Org1Id;
        historyEntries.push({
            id: createId(),
            documentId: doc1Org1Id,
            fromAreaId: fromArea,
            toAreaId: toArea,
            userId: user,
            comment: `Movimiento ${i + 1} del documento ${doc1Org1Id}.`,
            createdAt: new Date(Date.now() - (24 - i) * 60 * 60 * 1000), // Fechas decrecientes
        });
    }

    // --- Generar Historial para doc2Org1Id (pocos eventos) ---
    historyEntries.push({
        id: createId(),
        documentId: doc2Org1Id,
        fromAreaId: area1Org1Id,
        toAreaId: area2Org1Id,
        userId: user2Org1Id,
        comment: 'Primera derivación del informe.',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    });

    await db.insert(schema.documentHistory).values(historyEntries);
    console.log(`📜 Creados ${historyEntries.length} registros de historial.`);

    console.log('✅ Seeding completado exitosamente!');
    await client.end();
}

seed().catch((err) => {
    console.error('❌ Error durante el seeding:', err);
    process.exit(1);
});