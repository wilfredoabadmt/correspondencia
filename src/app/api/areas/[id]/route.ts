import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import type { IUpdateAreaUseCase } from '~/modules/gestion-documental/application/update-area.use-case';
import type { IDeleteAreaUseCase } from '~/modules/gestion-documental/application/delete-area.use-case';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const updateAreaUseCase = container.resolve<IUpdateAreaUseCase>(InjectionTokens.UpdateAreaUseCase);
        const updatedArea = await updateAreaUseCase.execute({
            areaId: params.id,
            organizationId: 'org_12345',
            data: body,
        });
        return NextResponse.json(updatedArea, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const deleteAreaUseCase = container.resolve<IDeleteAreaUseCase>(InjectionTokens.DeleteAreaUseCase);
        await deleteAreaUseCase.execute({
            areaId: params.id,
            organizationId: 'org_12345',
        });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
}
