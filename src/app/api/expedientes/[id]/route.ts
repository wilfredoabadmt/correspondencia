import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import { UpdateExpedienteSchema } from '~/modules/gestion-documental/application/update-expediente.dto';
import type { IGetExpedienteDetailsUseCase } from '~/modules/gestion-documental/application/get-expediente-details.use-case';
import type { IUpdateExpedienteUseCase } from '~/modules/gestion-documental/application/update-expediente.use-case';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const useCase = container.resolve<IGetExpedienteDetailsUseCase>(
            InjectionTokens.GetExpedienteDetailsUseCase
        );
        const expediente = await useCase.execute({
            id: params.id,
            organizationId: session.user.organizationId,
        });

        if (!expediente) {
            return NextResponse.json({ message: 'Expediente no encontrado.' }, { status: 404 });
        }

        return NextResponse.json(expediente, { status: 200 });
    } catch (error) {
        console.error('Error getting expediente:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const dto = UpdateExpedienteSchema.parse(body);

        const useCase = container.resolve<IUpdateExpedienteUseCase>(InjectionTokens.UpdateExpedienteUseCase);
        const updated = await useCase.execute({
            id: params.id,
            organizationId: session.user.organizationId,
            ...dto,
        });

        return NextResponse.json(updated, { status: 200 });
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
        console.error('Error updating expediente:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}
