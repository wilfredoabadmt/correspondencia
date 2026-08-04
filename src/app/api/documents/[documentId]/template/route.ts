import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import { serveTemplateFile } from '~/app/admin/templates/_actions';
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
        // First, try to serve a stored template file from the admin template store
        const stored = await serveTemplateFile(params.documentId, session.user.organizationId);
        if (stored) {
            const cleanFileName = stored.fileName.endsWith('.docx') ? stored.fileName : `${stored.fileName}.docx`;
            return new NextResponse(new Uint8Array(stored.buffer), {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`,
                },
            });
        }

        // Fallback to the generated template use case
        const useCase = container.resolve<GenerateDocxTemplateUseCase>(
            InjectionTokens.GenerateDocxTemplateUseCase
        );

        const { buffer, fileName } = await useCase.execute({
            documentId: params.documentId,
            organizationId: session.user.organizationId,
        });

        const cleanFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`,
            },
        });
    } catch (err: any) {
        console.error('[template route error]:', err);
        return new NextResponse(err.message || 'Error al generar la plantilla', { status: 400 });
    }
}

