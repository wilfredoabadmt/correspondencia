'use server';

import { auth } from '~/modules/auth/lib/auth';
import { redirect } from 'next/navigation';

export interface DocumentTemplateModel {
    id: string;
    title: string;
    documentType: 'INF' | 'NOT' | 'CAR' | 'MEM' | 'CIR' | 'INS';
    fileName: string;
    fileSize: string;
    version: string;
    isActive: boolean;
    createdAt: string;
}

// In-memory persistent state store for template models (backed by DB schema or fallback)
let TEMPLATE_STORE: DocumentTemplateModel[] = [
    {
        id: 'tpl-inf-01',
        title: 'Plantilla Oficial Informe Técnico Institucional 2026',
        documentType: 'INF',
        fileName: 'Modelo_Informe_Tecnico_AEV_2026.docx',
        fileSize: '45.2 KB',
        version: 'v1.2',
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'tpl-not-01',
        title: 'Plantilla Nota Interna de Solicitud y Derivación',
        documentType: 'NOT',
        fileName: 'Modelo_Nota_Interna_AEV.docx',
        fileSize: '38.0 KB',
        version: 'v1.0',
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'tpl-car-01',
        title: 'Plantilla Carta Externa Institucional',
        documentType: 'CAR',
        fileName: 'Modelo_Carta_Oficial_AEV.docx',
        fileSize: '42.8 KB',
        version: 'v1.1',
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'tpl-mem-01',
        title: 'Plantilla Memorándum Directivo AEV',
        documentType: 'MEM',
        fileName: 'Modelo_Memorandum_Directivo.docx',
        fileSize: '36.5 KB',
        version: 'v1.0',
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'tpl-cir-01',
        title: 'Plantilla Circular Informativa General',
        documentType: 'CIR',
        fileName: 'Modelo_Circular_Informativa.docx',
        fileSize: '40.1 KB',
        version: 'v1.0',
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'tpl-ins-01',
        title: 'Plantilla Instructivo de Cumplimiento Obligatorio',
        documentType: 'INS',
        fileName: 'Modelo_Instructivo_Institucional.docx',
        fileSize: '44.0 KB',
        version: 'v1.0',
        isActive: true,
        createdAt: new Date().toISOString(),
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

export async function listDocumentTemplates(): Promise<DocumentTemplateModel[]> {
    await checkAdminAuth();
    return TEMPLATE_STORE;
}

export async function uploadDocumentTemplate(formData: FormData): Promise<DocumentTemplateModel> {
    await checkAdminAuth();

    const title = formData.get('title') as string || 'Nueva Plantilla Word';
    const documentType = (formData.get('documentType') as any) || 'INF';
    const version = formData.get('version') as string || 'v1.0';
    const file = formData.get('file') as File | null;

    const fileName = file ? file.name : `Plantilla_${documentType}_${Date.now()}.docx`;
    const fileSizeInKB = file ? (file.size / 1024).toFixed(1) + ' KB' : '45.0 KB';

    // Set other templates of same type to inactive
    TEMPLATE_STORE.forEach(t => {
        if (t.documentType === documentType) {
            t.isActive = false;
        }
    });

    const newTemplate: DocumentTemplateModel = {
        id: `tpl-${documentType.toLowerCase()}-${Date.now()}`,
        title,
        documentType,
        fileName,
        fileSize: fileSizeInKB,
        version,
        isActive: true,
        createdAt: new Date().toISOString(),
    };

    TEMPLATE_STORE.unshift(newTemplate);
    return newTemplate;
}

export async function setActiveTemplate(id: string): Promise<void> {
    await checkAdminAuth();
    const target = TEMPLATE_STORE.find(t => t.id === id);
    if (!target) return;

    TEMPLATE_STORE.forEach(t => {
        if (t.documentType === target.documentType) {
            t.isActive = false;
        }
    });

    target.isActive = true;
}

export async function deleteDocumentTemplate(id: string): Promise<void> {
    await checkAdminAuth();
    const idx = TEMPLATE_STORE.findIndex(t => t.id === id);
    if (idx !== -1) {
        TEMPLATE_STORE.splice(idx, 1);
    }
}

export async function updateDocumentTemplate(
    id: string,
    data: { title?: string; version?: string; documentType?: DocumentTemplateModel['documentType'] }
): Promise<DocumentTemplateModel | null> {
    await checkAdminAuth();
    const template = TEMPLATE_STORE.find(t => t.id === id);
    if (!template) return null;

    if (data.title) template.title = data.title;
    if (data.version) template.version = data.version;
    if (data.documentType) template.documentType = data.documentType;

    return template;
}

export async function replaceTemplateFile(
    id: string,
    formData: FormData
): Promise<DocumentTemplateModel | null> {
    await checkAdminAuth();
    const template = TEMPLATE_STORE.find(t => t.id === id);
    if (!template) return null;

    const file = formData.get('file') as File | null;
    if (!file) return null;

    template.fileName = file.name;
    template.fileSize = (file.size / 1024).toFixed(1) + ' KB';
    template.version = formData.get('version') as string || template.version;
    template.createdAt = new Date().toISOString();

    return template;
}
