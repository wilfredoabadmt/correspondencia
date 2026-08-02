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
    return {
        user: {
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            organizationId: 'org_12345',
            role: 'OPERADOR',
            name: 'Operador Ejemplo',
        },
    };
}
