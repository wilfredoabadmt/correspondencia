import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { IDocumentRepository } from '~/modules/gestion-documental/core/document.repository';

export async function GET(
    request: Request,
    { params }: { params: { documentId: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const repo = container.resolve<IDocumentRepository>(
            InjectionTokens.DocumentRepository
        );

        const doc = await repo.findDetailsById({
            id: params.documentId,
            organizationId: session.user.organizationId,
        });

        if (!doc || !doc.isSigned) {
            return NextResponse.json(
                { message: 'El documento no existe o no cuenta con firma digital.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            isSigned: doc.isSigned,
            signedAt: doc.signedAt,
            signedByUserId: doc.signedByUserId,
            signatureHash: doc.signatureHash,
            verificationCode: doc.verificationCode,
            signedCertificateSubject: doc.signedCertificateSubject,
            signedCertificateIssuer: doc.signedCertificateIssuer,
            timestampAuthority: doc.timestampAuthority,
            timestampedAt: doc.timestampedAt,
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching certificate info:', error);
        return NextResponse.json(
            { message: 'Error al consultar metadatos del certificado digital.' },
            { status: 500 }
        );
    }
}
