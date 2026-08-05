import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { SignDocumentJacobitusUseCase } from '~/modules/gestion-documental/application/sign-document-jacobitus.use-case';

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
        const useCase = container.resolve<SignDocumentJacobitusUseCase>(
            InjectionTokens.SignDocumentJacobitusUseCase
        );

        const updatedDoc = await useCase.execute({
            documentId: params.documentId,
            organizationId: session.user.organizationId,
            userId: session.user.id,
            slot: body.slot || 1,
            pin: body.pin || '',
            alias: body.alias || 'cert-default',
            pdfBase64: body.pdfBase64 || '',
        });

        return NextResponse.json(updatedDoc, { status: 200 });
    } catch (error) {
        console.error('Error signing document with Jacobitus:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Error al firmar con Jacobitus.' },
            { status: 400 }
        );
    }
}
