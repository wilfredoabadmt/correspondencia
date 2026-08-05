import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListProveidosUseCase } from '~/modules/gestion-documental/application/list-proveidos.use-case';

export async function GET() {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const useCase = container.resolve<ListProveidosUseCase>(
            InjectionTokens.ListProveidosUseCase
        );

        const list = await useCase.execute(session.user.organizationId);
        return NextResponse.json(list, { status: 200 });
    } catch (error) {
        console.error('Error fetching proveídos catalog:', error);
        return NextResponse.json(
            { message: 'Error al obtener el catálogo de proveídos.' },
            { status: 500 }
        );
    }
}
