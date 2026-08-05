import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { GenerateReceiptPdfUseCase } from '~/modules/gestion-documental/application/generate-receipt-pdf.use-case';

export async function GET(
    request: Request,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const useCase = container.resolve<GenerateReceiptPdfUseCase>(
            InjectionTokens.GenerateReceiptPdfUseCase
        );

        const pdfBuffer = await useCase.execute({
            documentId: params.documentId,
            organizationId: session.user.organizationId,
        });

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="recibo-${params.documentId}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Error al generar el recibo PDF.' },
            { status: 500 }
        );
    }
}
