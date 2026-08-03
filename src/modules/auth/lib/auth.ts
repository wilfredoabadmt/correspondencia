import { cookies } from 'next/headers';

export type UserSession = {
    user?: {
        id: string;
        organizationId: string;
        role: string;
        email?: string;
        name?: string;
    };
};

export async function auth(): Promise<UserSession | null> {
    try {
        const cookieStore = cookies();
        const sessionToken = cookieStore.get('session_token')?.value;

        if (!sessionToken) {
            return null;
        }

        const userRole = cookieStore.get('user_role')?.value || 'OPERADOR';
        const userOrg = cookieStore.get('user_org')?.value || 'org_12345';
        const userName = cookieStore.get('user_name')?.value || 'Usuario Autenticado';
        const userEmail = cookieStore.get('user_email')?.value || 'usuario@aevivienda.gob.bo';

        return {
            user: {
                id: sessionToken,
                organizationId: userOrg,
                role: userRole,
                name: userName,
                email: userEmail,
            },
        };
    } catch {
        return null;
    }
}
