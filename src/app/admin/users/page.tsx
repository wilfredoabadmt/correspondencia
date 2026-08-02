import 'reflect-metadata';
import { redirect } from 'next/navigation';

import { auth } from '~/modules/auth/lib/auth';
import { listUsers } from './_actions';
import { UserManagementTable } from '~/components/users/user-management-table';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const userRole = (session.user as any).role || 'OPERADOR';

    if (userRole !== 'ADMINISTRADOR') {
        redirect('/');
    }

    const users = await listUsers();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
            <UserManagementTable initialUsers={users} />
        </div>
    );
}