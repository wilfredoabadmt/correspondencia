import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { GenerateDocxTemplateUseCase } from '~/modules/gestion-documental/application/generate-docx-template.use-case';

export async function GET(
    request: NextRequest,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return new NextResponse('No autorizado', { status: 401 });
    }

    try {
        const useCase = container.resolve<GenerateDocxTemplateUseCase>(
            InjectionTokens.GenerateDocxTemplateUseCase
        );

        const { buffer, fileName } = await useCase.execute({
            documentId: params.documentId,
            organizationId: session.user.organizationId,
        });

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (err: any) {
        return new NextResponse(err.message || 'Error al generar la plantilla', { status: 400 });
    }
}
