'use server';

import { auth } from '~/modules/auth/lib/auth';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { eq } from 'drizzle-orm';
import * as schema from '~/db/schema';
import type { IStorageService } from '~/modules/storage/core/storage.service';

export interface DocumentTemplateModel {
    id: string;
    title: string;
    documentType: 'INF' | 'NOT' | 'CAR' | 'MEM' | 'CIR' | 'INS';
    fileName: string;
    fileSize: string;
    version: string;
    isActive: boolean;
    createdAt: string;
    /** R2 object key for the stored .docx file */
    fileKey?: string;
    /** In-memory buffer for uploaded template file */
    fileBuffer?: Buffer;
}

// In-memory metadata store (file content lives in R2 or memory)
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

function getStorageService(): IStorageService | null {
    try {
        return container.resolve<IStorageService>(InjectionTokens.StorageService);
    } catch (e) {
        console.error('[templates] Failed to resolve StorageService from container:', e);
        return null;
    }
}

function mapDocTypeToCode(docType: string): string {
    const norm = docType.toLowerCase().trim();
    if (norm.includes('informe') || norm === 'inf') return 'INF';
    if (norm.includes('nota') || norm === 'not') return 'NOT';
    if (norm.includes('carta') || norm === 'car') return 'CAR';
    if (norm.includes('memor') || norm === 'mem') return 'MEM';
    if (norm.includes('circul') || norm === 'cir') return 'CIR';
    if (norm.includes('instruct') || norm === 'ins') return 'INS';
    return 'INF';
}

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
    return TEMPLATE_STORE.map(({ fileKey, fileBuffer, ...rest }) => rest);
}

import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'templates');

function ensureUploadsDir() {
    try {
        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
    } catch (e) {
        console.error('[templates] Failed to create uploads dir:', e);
    }
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

    const newId = `tpl-${documentType.toLowerCase()}-${Date.now()}`;

    let fileBuffer: Buffer | undefined;
    let fileKey: string | undefined;

    if (file) {
        fileBuffer = Buffer.from(await file.arrayBuffer());
        ensureUploadsDir();
        try {
            await fs.promises.writeFile(path.join(UPLOADS_DIR, `${newId}.docx`), fileBuffer);
        } catch (e) {
            console.error('[uploadDocumentTemplate] Failed to save to local disk:', e);
        }

        const storage = getStorageService();
        if (storage) {
            try {
                fileKey = `templates/${newId}/${file.name}`;
                await storage.uploadFile(fileKey, fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            } catch (e) {
                console.error('[uploadDocumentTemplate] Failed to upload to R2:', e);
                fileKey = undefined;
            }
        }
    }

    const newTemplate: DocumentTemplateModel = {
        id: newId,
        title,
        documentType,
        fileName,
        fileSize: fileSizeInKB,
        version,
        isActive: true,
        createdAt: new Date().toISOString(),
        fileKey,
        fileBuffer,
    };

    TEMPLATE_STORE.unshift(newTemplate);
    return { ...newTemplate, fileKey: undefined, fileBuffer: undefined };
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

    return { ...template, fileKey: undefined, fileBuffer: undefined };
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

    const buffer = Buffer.from(await file.arrayBuffer());
    template.fileBuffer = buffer;

    ensureUploadsDir();
    try {
        await fs.promises.writeFile(path.join(UPLOADS_DIR, `${id}.docx`), buffer);
    } catch (e) {
        console.error('[replaceTemplateFile] Failed to save to local disk:', e);
    }

    // Upload new file to R2
    const storage = getStorageService();
    const fileKey = `templates/${id}/${file.name}`;
    if (storage) {
        try {
            await storage.uploadFile(fileKey, buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        } catch (e) {
            console.error('[replaceTemplateFile] Failed to upload to R2:', e);
        }
    }

    template.fileName = file.name;
    template.fileSize = (file.size / 1024).toFixed(1) + ' KB';
    template.version = formData.get('version') as string || template.version;
    template.createdAt = new Date().toISOString();
    template.fileKey = fileKey;

    return { ...template, fileKey: undefined, fileBuffer: undefined };
}

/**
 * Returns the .docx file buffer for a template or active template for document.
 */
export async function serveTemplateFile(
    id: string,
    organizationId: string
): Promise<{ buffer: number[]; fileName: string } | null> {
    try {
        let template = TEMPLATE_STORE.find(t => t.id === id);

        if (!template) {
            const upperId = id.toUpperCase();
            template = TEMPLATE_STORE.find(t => t.documentType === upperId && t.isActive);

            if (!template) {
                try {
                    const docRepo = container.resolve<any>(InjectionTokens.DocumentRepository);
                    const doc = await docRepo.findDetailsById({ id, organizationId });
                    if (doc?.documentType) {
                        const typeCode = mapDocTypeToCode(doc.documentType);
                        template = TEMPLATE_STORE.find(t => t.documentType === typeCode && t.isActive);
                    }
                } catch {
                    // Ignore repo error in test/unconnected environment
                }
            }
        }

        // Fallback: if id is a document ID and no specific type was found, use active INF template or first active template
        if (!template) {
            template = TEMPLATE_STORE.find(t => t.documentType === 'INF' && t.isActive) || TEMPLATE_STORE.find(t => t.isActive);
        }

        if (!template) return null;

        // 1. In-memory buffer
        if (template.fileBuffer) {
            return { buffer: Array.from(template.fileBuffer), fileName: template.fileName };
        }

        // 2. Local disk file
        ensureUploadsDir();
        const diskPath = path.join(UPLOADS_DIR, `${template.id}.docx`);
        if (fs.existsSync(diskPath)) {
            try {
                const buf = await fs.promises.readFile(diskPath);
                template.fileBuffer = buf;
                return { buffer: Array.from(buf), fileName: template.fileName };
            } catch (e) {
                console.error('[serveTemplateFile] Failed to read from local disk:', e);
            }
        }

        // 3. R2 Cloud storage
        if (template.fileKey) {
            const storage = getStorageService();
            if (storage) {
                try {
                    const buf = await storage.getFileBuffer(template.fileKey);
                    template.fileBuffer = buf;
                    return { buffer: Array.from(buf), fileName: template.fileName };
                } catch {
                    // Fallthrough to generator fallback
                }
            }
        }

        // 4. Fallback: generate a default docx template buffer using DocxGeneratorService with template.fileName
        try {
            const docxService = container.resolve<any>(InjectionTokens.DocxGeneratorService);
            const genBuffer = await docxService.generateTemplate({
                citeCode: 'INF-001/2026',
                dateStr: new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }),
                recipientName: 'Director General',
                recipientRole: 'Responsable',
                senderName: 'Servidor Público',
                senderRole: 'Encargado',
                subject: template.title,
                documentType: template.documentType,
            });
            return { buffer: Array.from(genBuffer), fileName: template.fileName };
        } catch {
            return null;
        }
    } catch (err) {
        console.error('[serveTemplateFile] Storage error:', err);
        return null;
    }
}





