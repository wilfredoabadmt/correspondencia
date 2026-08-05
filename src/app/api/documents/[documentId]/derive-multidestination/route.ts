import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { DeriveMultidestinationDocumentUseCase } from '~/modules/gestion-documental/application/derive-multidestination-document.use-case';

export async function POST(
    request: Request,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.id || !session.user.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const useCase = container.resolve<DeriveMultidestinationDocumentUseCase>(
            InjectionTokens.DeriveMultidestinationDocumentUseCase
        );

        await useCase.execute({
            documentId: params.documentId,
            organizationId: session.user.organizationId,
            userId: session.user.id,
            originalAreaId: body.originalAreaId,
            copyAreaIds: body.copyAreaIds || [],
            instructionCodes: body.instructionCodes || [],
            comment: body.comment || null,
        });

        return NextResponse.json({ message: 'Documento derivado exitosamente.' }, { status: 200 });
    } catch (error) {
        console.error('Error deriving multidestination document:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Error al derivar documento.' },
            { status: 400 }
        );
    }
}
