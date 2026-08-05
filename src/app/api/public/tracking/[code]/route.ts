import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import type { GetPublicTrackingInfoUseCase } from '~/modules/gestion-documental/application/get-public-tracking-info.use-case';

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const code = decodeURIComponent(params.code);
        const useCase = container.resolve<GetPublicTrackingInfoUseCase>(
            InjectionTokens.GetPublicTrackingInfoUseCase
        );

        const result = await useCase.execute(code);

        if (!result) {
            return NextResponse.json(
                { message: 'Trámite no encontrado. Verifique el código de seguimiento.' },
                { status: 404 }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching public tracking info:', error);
        return NextResponse.json(
            { message: 'Error interno al consultar el estado del trámite.' },
            { status: 500 }
        );
    }
}
