import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import type { VerifyDocumentUseCase } from '~/modules/gestion-documental/application/verify-document.use-case';

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const useCase = container.resolve<VerifyDocumentUseCase>(
            InjectionTokens.VerifyDocumentUseCase
        );

        const verificationData = await useCase.execute(params.code);

        return NextResponse.json(verificationData, { status: 200 });
    } catch (error) {
        console.error('Error verifying document:', error);
        return NextResponse.json({ message: 'Error al verificar el documento.' }, { status: 500 });
    }
}
