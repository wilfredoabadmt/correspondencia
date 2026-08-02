import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { container, InjectionTokens } from '~/core/container';
import { AssignRoleSchema } from '~/modules/auth/application/assign-role.dto';
import { IAssignRoleUseCase } from '~/modules/auth/application/assign-role.use-case';
import { AuthorizationError } from '~/modules/auth/application/assign-role.use-case.impl';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Auth (Placeholder)
        // In a real app, you'd get this from a session
        const auth = {
            actorId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Mock admin user ID
        };

        // 2. Validation
        const targetUserId = params.id;
        const body = await request.json();
        const { role: newRole } = AssignRoleSchema.parse(body);

        // 3. Execution
        const assignRoleUseCase = container.resolve<IAssignRoleUseCase>(
            InjectionTokens.AssignRoleUseCase
        );
        const updatedUser = await assignRoleUseCase.execute({
            actorId: auth.actorId,
            targetUserId,
            newRole,
        });

        // 4. Response
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { message: 'Invalid input data.', errors: error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        if (error instanceof AuthorizationError) {
            return NextResponse.json({ message: error.message }, { status: 403 });
        }

        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }

        console.error('Error assigning role:', error);
        return NextResponse.json(
            { message: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}