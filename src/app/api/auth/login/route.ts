import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { container, InjectionTokens } from '~/core/container';
import type { ILoginUseCase } from '~/modules/auth/application/login.use-case';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const loginUseCase = container.resolve<ILoginUseCase>(InjectionTokens.LoginUseCase);
        const user = await loginUseCase.execute({
            email: body.email,
            password: body.password,
            organizationId: body.organizationId || 'org_12345',
        });
        const response = NextResponse.json(user, { status: 200 });
        response.headers.set('Set-Cookie', 'session_token=mock-token; HttpOnly; Path=/');
        return response;
    } catch (error) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
}
