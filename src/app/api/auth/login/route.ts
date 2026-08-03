import 'reflect-metadata';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.email || 'superadmin@gestordoc.gob.bo';
        const organizationId = body.organizationId || 'org_12345';
        let role = body.role;

        if (!role) {
            if (email.toLowerCase().includes('super')) role = 'SUPERADMIN';
            else if (email.toLowerCase().includes('admin')) role = 'ADMINISTRADOR';
            else role = 'OPERADOR';
        }

        const name = role === 'SUPERADMIN' 
            ? 'Super Usuario de Sistema (Global Admin)'
            : role === 'ADMINISTRADOR'
                ? 'Administrador Institucional (TI & Gerencia)'
                : 'Operador de Correspondencia';

        const userId = role === 'SUPERADMIN' ? 'superadmin-id' : role === 'ADMINISTRADOR' ? 'admin-a-id' : 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

        const userPayload = {
            id: userId,
            email: email,
            name: name,
            role: role,
            organizationId: organizationId,
        };

        const response = NextResponse.json(userPayload, { status: 200 });

        // Set auth cookies for session tracking
        response.cookies.set('session_token', userId, { path: '/', httpOnly: true, sameSite: 'lax' });
        response.cookies.set('user_role', role, { path: '/', httpOnly: false, sameSite: 'lax' });
        response.cookies.set('user_org', organizationId, { path: '/', httpOnly: false, sameSite: 'lax' });
        response.cookies.set('user_name', name, { path: '/', httpOnly: false, sameSite: 'lax' });
        response.cookies.set('user_email', email, { path: '/', httpOnly: false, sameSite: 'lax' });

        return response;
    } catch (error) {
        return NextResponse.json({ message: 'Error procesando la autenticación' }, { status: 400 });
    }
}
