import 'reflect-metadata';
import { redirect } from 'next/navigation';

import { auth } from '~/modules/auth/lib/auth';
import { listUsers } from './_actions';
import { fetchPersistentRoles } from '~/app/admin/roles/_actions';
import { UserManagementTable } from '~/components/users/user-management-table';
import { SystemShell } from '~/components/layout/SystemShell';

export const dynamic = 'force-dynamic';

export default async function UserManagementPage() {
    const session = await auth();

    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const user = session.user;
    const userRole = user.role || 'OPERADOR';

    if (userRole !== 'ADMINISTRADOR' && userRole !== 'SUPERADMIN') {
        redirect('/dashboard');
    }

    const [users, roles] = await Promise.all([
        listUsers().catch(() => []),
        fetchPersistentRoles().catch(() => []),
    ]);

    return (
        <SystemShell
            userRole={userRole}
            userName={user.name}
            userEmail={user.email}
            organizationId={user.organizationId}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                        Administración de cuentas de usuario por organización y asignación de roles institucionales.
                    </p>
                </div>

                <UserManagementTable initialUsers={users} availableRoles={roles} />
            </div>
        </SystemShell>
    );
}