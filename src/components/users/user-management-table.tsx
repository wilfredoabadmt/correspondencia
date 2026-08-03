'use client';

import * as React from 'react';
import type { User, UserRole } from '~/modules/users/core/user.repository';
import type { PersistentRoleItem } from '~/app/admin/roles/_actions';
import { createUser, deleteUser } from '~/app/admin/users/_actions';

type UserManagementTableProps = {
    initialUsers: User[];
    availableRoles?: PersistentRoleItem[];
};

const LOCAL_STORAGE_KEY = 'gestordoc_custom_roles';

export function UserManagementTable({ initialUsers, availableRoles = [] }: UserManagementTableProps) {
    const [users, setUsers] = React.useState<User[]>(initialUsers);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<string>('SECRETARIA');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<string | null>(null);

    const [allRoles, setAllRoles] = React.useState<PersistentRoleItem[]>(availableRoles);

    React.useEffect(() => {
        let localData: PersistentRoleItem[] = [];
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (stored) localData = JSON.parse(stored);
            } catch {
                localData = [];
            }
        }

        const map = new Map<string, PersistentRoleItem>();
        availableRoles.forEach(r => map.set(r.name, r));
        localData.forEach(r => map.set(r.name, r));

        setAllRoles(Array.from(map.values()));
    }, [availableRoles]);

    // Combine system default roles with custom roles
    const roleOptions = React.useMemo(() => {
        const systemRoles = [
            { id: 'OPERADOR', name: 'OPERADOR (Servidor Público / Ventanilla)' },
            { id: 'ADMINISTRADOR', name: 'ADMINISTRADOR (Jefe de Oficina)' },
            { id: 'SUPERADMIN', name: 'SUPERADMIN (Administrador de Sistema)' },
        ];

        const customRoles = allRoles
            .filter(r => !['OPERADOR', 'ADMINISTRADOR', 'SUPERADMIN'].includes(r.name))
            .map(r => ({
                id: r.name,
                name: `${r.name} (${r.office})`,
            }));

        return [...systemRoles, ...customRoles];
    }, [allRoles]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;

        try {
            setLoading(true);
            setMessage(null);
            const result = await createUser(name.trim(), email.trim(), role as UserRole);
            
            const newUser: User = (result.user as any) || {
                id: `usr-${Date.now()}`,
                name: name.trim(),
                email: email.trim(),
                role,
                organizationId: 'org_12345',
                roleId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            setUsers(prev => [newUser, ...prev]);
            setMessage(`¡Usuario "${newUser.name}" creado con éxito con rol "${role}"! Contraseña temporal: ${result.temporaryPassword || 'TempPass123'}`);
            setIsCreateModalOpen(false);
            setName('');
            setEmail('');
            setRole('SECRETARIA');
        } catch (err: any) {
            setMessage(`Error al crear usuario: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string, userName?: string | null) => {
        const displayName = userName || 'Usuario';
        if (!confirm(`¿Está seguro de eliminar la cuenta del usuario "${displayName}"?`)) return;

        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            setMessage(`Usuario "${displayName}" eliminado.`);
        } catch (err: any) {
            setMessage(`Error al eliminar: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
                <div>
                    <h3 className="text-base font-bold text-white">Directorio de Usuarios de la Organización</h3>
                    <p className="text-xs text-slate-300">Total registrados: <span className="text-cyan-400 font-mono font-bold">{users.length}</span> usuarios</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                    <span>+ Crear Nuevo Usuario</span>
                </button>
            </div>

            {/* Notification alert */}
            {message && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center justify-between gap-3">
                    <span className="font-mono">{message}</span>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>
            )}

            {/* User Table */}
            <div className="glass-panel-glow rounded-3xl p-6 border border-slate-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="border-b border-slate-800 text-slate-300 uppercase font-mono">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Nombre Completo</th>
                                <th className="py-3 px-4 font-semibold">Correo Electrónico</th>
                                <th className="py-3 px-4 font-semibold">Rol Asignado</th>
                                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400">
                                        No hay usuarios registrados en esta organización.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const displayName = user.name || 'Sin Nombre';
                                    const roleStr = user.role || 'OPERADOR';
                                    const isCustom = !['SUPERADMIN', 'ADMINISTRADOR', 'OPERADOR'].includes(roleStr);

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-900/60 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                                                    {displayName.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span>{displayName}</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-cyan-300 font-mono">{user.email}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                                                    roleStr === 'SUPERADMIN'
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                        : roleStr === 'ADMINISTRADOR'
                                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                                            : isCustom
                                                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                                                }`}>
                                                    {isCustom ? `🛡️ ${roleStr}` : roleStr}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
                                                    title="Eliminar Usuario"
                                                >
                                                    Eliminar 🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-md glass-panel-glow rounded-3xl p-6 space-y-5 border border-cyan-500/40 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white">Crear Nuevo Usuario</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Ing. Roberto Mamani"
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@aevivienda.gob.bo"
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Rol Asignado (Selección Dinámica)</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold text-cyan-300 focus:border-cyan-500 outline-none"
                                >
                                    {roleOptions.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-blue-600 hover:bg-blue-500 shadow-md"
                                >
                                    {loading ? 'Creando...' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}