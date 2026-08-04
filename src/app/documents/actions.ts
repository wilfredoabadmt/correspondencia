'use server';

import { container, InjectionTokens } from '~/core/container';
import type { IDocumentRepository } from '~/modules/gestion-documental/core/document.repository';
import { revalidatePath } from 'next/cache';

export async function createGeneratedDocument(data: {
    trackingCode: string;
    trackingId: string;
    subject: string;
    documentType: string;
    sender: string;
    status: string;
    organizationId: string;
}) {
    const docRepo = container.resolve<IDocumentRepository>(InjectionTokens.DocumentRepository);

    try {
        // Minimal insert - only essential fields
        const doc = await docRepo.create({
            organizationId: data.organizationId,
            trackingId: data.trackingId,
            trackingCode: data.trackingCode,
            subject: data.subject,
            documentType: data.documentType,
            sender: data.sender,
            status: data.status,
            receptionDate: new Date(),
        });

        revalidatePath('/documents');
        return { success: true, id: doc.id };
    } catch (error: any) {
        console.error('=== DOCUMENT CREATION ERROR ===');
        console.error('Error message:', error?.message);
        console.error('Error code:', error?.code);
        console.error('Error detail:', error?.detail);
        console.error('Full error:', error);
        
        return { 
            success: false, 
            error: error?.message || 'Database error',
            code: error?.code || 'UNKNOWN',
            detail: error?.detail || ''
        };
    }
}
