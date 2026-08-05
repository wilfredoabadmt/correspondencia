import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ManageCiteConfigsUseCase } from '~/modules/gestion-documental/application/manage-cite-configs.use-case';

export async function GET() {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const useCase = container.resolve<ManageCiteConfigsUseCase>(
            InjectionTokens.ManageCiteConfigsUseCase
        );

        const configs = await useCase.list(session.user.organizationId);
        return NextResponse.json(configs, { status: 200 });
    } catch (error) {
        console.error('Error fetching CITE configs:', error);
        return NextResponse.json({ message: 'Error al obtener configuraciones de CITE.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const useCase = container.resolve<ManageCiteConfigsUseCase>(
            InjectionTokens.ManageCiteConfigsUseCase
        );

        const result = await useCase.save({
            ...body,
            organizationId: session.user.organizationId,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error al guardar la regla de CITE.' }, { status: 500 });
    }
}
