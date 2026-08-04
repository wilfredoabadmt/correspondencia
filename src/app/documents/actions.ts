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
    });

    revalidatePath('/documents');
    return { success: true, id: doc.id };
}
