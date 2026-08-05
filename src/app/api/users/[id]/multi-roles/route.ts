import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { AssignUserRolesUseCase } from '~/modules/users/application/assign-user-roles.use-case';
import type { IUserRoleAssignmentRepository } from '~/modules/users/core/user-role-assignment.repository';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const repo = container.resolve<IUserRoleAssignmentRepository>(
            InjectionTokens.UserRoleAssignmentRepository
        );

        const roles = await repo.getUserRoles(params.id, session.user.organizationId);
        return NextResponse.json(roles, { status: 200 });
    } catch (error) {
        console.error('Error fetching user roles:', error);
        return NextResponse.json({ message: 'Error al obtener roles del usuario.' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const useCase = container.resolve<AssignUserRolesUseCase>(
            InjectionTokens.AssignUserRolesUseCase
        );

        await useCase.execute({
            userId: params.id,
            organizationId: session.user.organizationId,
            roleIds: body.roleIds || [],
            jobTitle: body.jobTitle !== undefined ? body.jobTitle : null,
        });

        return NextResponse.json({ message: 'Roles y cargo asignados exitosamente.' }, { status: 200 });
    } catch (error) {
        console.error('Error assigning user roles and job title:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Error al asignar roles y cargo.' },
            { status: 400 }
        );
    }
}
