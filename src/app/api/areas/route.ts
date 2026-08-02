import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import type { IListAreasUseCase } from '~/modules/gestion-documental/application/list-areas.use-case';
import type { ICreateAreaUseCase } from '~/modules/gestion-documental/application/create-area.use-case';

export async function GET(request: Request) {
    try {
        const listAreasUseCase = container.resolve<IListAreasUseCase>(InjectionTokens.ListAreasUseCase);
        const areas = await listAreasUseCase.execute({ organizationId: 'org_12345' });
        return NextResponse.json(areas, { status: 200 });
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const createAreaUseCase = container.resolve<ICreateAreaUseCase>(InjectionTokens.CreateAreaUseCase);
        const createdArea = await createAreaUseCase.execute({
            name: body.name,
            code: body.code,
            organizationId: 'org_12345',
        });
        return NextResponse.json(createdArea, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
