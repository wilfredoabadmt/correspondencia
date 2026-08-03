import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { IDisassociateDocumentUseCase } from '~/modules/gestion-documental/application/disassociate-document.use-case';

export async function PUT(
    request: Request,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const useCase = container.resolve<IDisassociateDocumentUseCase>(
            InjectionTokens.DisassociateDocumentFromExpedienteUseCase
        );
        await useCase.execute({
            documentId: params.documentId,
            organizationId: session.user.organizationId,
        });

        return NextResponse.json({ message: 'Documento desvinculado correctamente.' }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        console.error('Error disassociating document:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}
