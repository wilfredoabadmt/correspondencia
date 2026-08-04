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
        // Create a minimal document record
        const doc = await docRepo.create({
            organizationId: data.organizationId,
            trackingId: data.trackingId,
            trackingCode: data.trackingCode,
            subject: data.subject,
            documentType: data.documentType,
            sender: data.sender,
            status: data.status,
            receptionDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            destinationAreaId: null,
            areaHierarchyId: null,
            currentUserId: null,
            expedienteId: null,
            groupedIntoDocumentId: null,
            folderCategory: null,
            archiveObservations: null,
            fileKey: null,
            downloadUrl: null,
        });

        revalidatePath('/documents');
        return { success: true, id: doc.id };
    } catch (error: any) {
        console.error('Error creating document:', error);
        // Return detailed error for debugging
        return { 
            success: false, 
            error: error?.message || 'Unknown database error',
            details: error?.stack?.split('\n')[0] || ''
        };
    }
}
