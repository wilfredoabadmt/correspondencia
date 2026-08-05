import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { SignDocumentUseCase } from '~/modules/gestion-documental/application/sign-document.use-case';

export async function POST(
    request: Request,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const useCase = container.resolve<SignDocumentUseCase>(
            InjectionTokens.SignDocumentUseCase
        );

        const result = await useCase.execute({
            documentId: params.documentId,
            userId: session.user.id,
            organizationId: session.user.organizationId,
        });

        return NextResponse.json(
            {
                message: 'Documento firmado digitalmente con éxito.',
                verificationCode: result.verificationCode,
                signatureHash: result.signatureHash,
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        console.error('Error signing document:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}
