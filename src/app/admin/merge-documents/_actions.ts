'use server';

import { auth } from '~/modules/auth/lib/auth';
import { redirect } from 'next/navigation';

export interface MergeDocumentItem {
    id: string;
    trackingCode: string;
    subject: string;
    sender: string;
    documentType: string;
    status: string;
    groupedIntoId?: string | null;
    groupedAt?: string | null;
}

let MERGE_DOCUMENTS_STORE: MergeDocumentItem[] = [
    {
        id: 'doc-001',
        trackingCode: 'AEV/DNP/INF/Nro.0028/2026',
        subject: 'INFORME DE EVALUACIÓN TÉCNICA DE PROYECTO DE VIVIENDA LA PAZ',
        sender: 'Ing. Carlos Mendoza (Jefe de Proyectos)',
        documentType: 'Informe',
        status: 'Recibido',
        groupedIntoId: null,
    },
    {
        id: 'doc-002',
        trackingCode: 'AEV/DNP/NOT/Nro.0142/2026',
        subject: 'SOLICITUD DE ASIGNACIÓN PRESUPUESTARIA ADICIONAL',
        sender: 'Lic. María Fernandez (Finanzas)',
        documentType: 'Nota Interna',
        status: 'Pendiente',
        groupedIntoId: null,
    },
    {
        id: 'doc-003',
        trackingCode: 'AEV/DNP/CAR/Nro.0089/2026',
        subject: 'CARTA DE NOTIFICACIÓN A EMPRESA CONSTRUCTORA SANTA CRUZ',
        sender: 'Abg. Roberto Mamani (Asesor Legal)',
        documentType: 'Carta',
        status: 'Derivado',
        groupedIntoId: 'doc-001',
        groupedAt: new Date().toISOString(),
    },
    {
        id: 'doc-004',
        trackingCode: 'AEV/DNP/MEM/Nro.0033/2026',
        subject: 'MEMORÁNDUM DE DESIGNACIÓN DE COMISIÓN DE RECEPCIÓN',
        sender: 'Dirección General Ejecutiva',
        documentType: 'Memorándum',
        status: 'Recibido',
        groupedIntoId: null,
    },
];

async function checkAdminAuth() {
    const session = await auth();
    if (!session?.user?.organizationId) {
        redirect('/login');
    }
    const role = (session.user as any).role || 'OPERADOR';
    if (role !== 'SUPERADMIN' && role !== 'ADMINISTRADOR') {
        redirect('/dashboard');
    }
    return session.user;
}

export async function listMergeDocuments(): Promise<MergeDocumentItem[]> {
    await checkAdminAuth();
    return MERGE_DOCUMENTS_STORE;
}

export async function mergeDocumentsAction(parentDocumentId: string, childDocumentIds: string[]): Promise<void> {
    await checkAdminAuth();
    const parent = MERGE_DOCUMENTS_STORE.find(d => d.id === parentDocumentId);
    if (!parent) throw new Error('Documento principal no encontrado.');

    childDocumentIds.forEach(childId => {
        const child = MERGE_DOCUMENTS_STORE.find(d => d.id === childId);
        if (child && child.id !== parentDocumentId) {
            child.groupedIntoId = parentDocumentId;
            child.groupedAt = new Date().toISOString();
        }
    });
}

export async function unmergeDocumentAction(childDocumentId: string): Promise<void> {
    await checkAdminAuth();
    const child = MERGE_DOCUMENTS_STORE.find(d => d.id === childDocumentId);
    if (child) {
        child.groupedIntoId = null;
        child.groupedAt = null;
    }
}
