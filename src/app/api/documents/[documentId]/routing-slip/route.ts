import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { GenerateRoutingSlipPdfUseCase } from '~/modules/gestion-documental/application/generate-routing-slip-pdf.use-case';

export async function GET(
    request: NextRequest,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return new NextResponse('No autorizado', { status: 401 });
    }

    try {
        const useCase = container.resolve<GenerateRoutingSlipPdfUseCase>(
            InjectionTokens.GenerateRoutingSlipPdfUseCase
        );

        const { buffer, fileName } = await useCase.execute({
            documentId: params.documentId,
            organizationId: session.user.organizationId,
        });

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${fileName}"`,
            },
        });
    } catch (err: any) {
        return new NextResponse(err.message || 'Error al generar la Hoja de Ruta en PDF', { status: 400 });
    }
}
