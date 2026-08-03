import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import { CreateExpedienteSchema } from '~/modules/gestion-documental/application/create-expediente.dto';
import type { ICreateExpedienteUseCase } from '~/modules/gestion-documental/application/create-expediente.use-case';
import type { IListExpedientesUseCase } from '~/modules/gestion-documental/application/list-expedientes.use-case';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
        const query = searchParams.get('query') || undefined;
        const status = searchParams.get('status') || undefined;

        const useCase = container.resolve<IListExpedientesUseCase>(InjectionTokens.ListExpedientesUseCase);
        const result = await useCase.execute({
            organizationId: session.user.organizationId,
            page,
            pageSize,
            query,
            status,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error listing expedientes:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const dto = CreateExpedienteSchema.parse(body);

        const useCase = container.resolve<ICreateExpedienteUseCase>(InjectionTokens.CreateExpedienteUseCase);
        const expediente = await useCase.execute({
            ...dto,
            organizationId: session.user.organizationId,
        });

        return NextResponse.json(expediente, { status: 201 });
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
        console.error('Error creating expediente:', error);
        return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
    }
}
