import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import { AssociateDocumentSchema } from '~/modules/gestion-documental/application/update-expediente.dto';
import type { IAssociateDocumentUseCase } from '~/modules/gestion-documental/application/associate-document.use-case';

export async function PUT(
    request: Request,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { expedienteId } = AssociateDocumentSchema.parse(body);

        const useCase = container.resolve<IAssociateDocumentUseCase>(
            InjectionTokens.AssociateDocumentToExpedienteUseCase
        );
        await useCase.execute({
            documentId: params.documentId,
            expedienteId,
            organizationId: session.user.organizationId,
        });

        return NextResponse.json({ message: 'Documento asociado correctamente.' }, { status: 200 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { message: 'Datos inválidos.', errors: error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        console.error('Error associating document:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}
