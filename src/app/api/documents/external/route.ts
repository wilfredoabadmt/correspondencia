import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { RegisterExternalDocumentUseCase } from '~/modules/gestion-documental/application/register-external-document.use-case';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const useCase = container.resolve<RegisterExternalDocumentUseCase>(
            InjectionTokens.RegisterExternalDocumentUseCase
        );

        const createdDoc = await useCase.execute({
            organizationId: session.user.organizationId,
            areaHierarchyId: body.areaHierarchyId,
            subject: body.subject,
            documentType: body.documentType,
            receptionDate: new Date(body.receptionDate || Date.now()),
            attachmentStorageKey: body.attachmentStorageKey || null,
            applicantIdentityDocument: body.applicantIdentityDocument || null,
            applicantName: body.applicantName,
            applicantInstitution: body.applicantInstitution || null,
            applicantPhone: body.applicantPhone || null,
            applicantEmail: body.applicantEmail || null,
        });

        return NextResponse.json(createdDoc, { status: 201 });
    } catch (error) {
        console.error('Error registering external document:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Error al registrar trámite de ventanilla única.' },
            { status: 400 }
        );
    }
}
