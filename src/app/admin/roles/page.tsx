'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SystemShell } from '~/components/layout/SystemShell';
import {
    fetchPersistentRoles,
    createPersistentRole,
    updatePersistentRole,
    deletePersistentRole,
    type PersistentRoleItem,
} from './_actions';

interface PermissionOption {
    id: string;
    title: string;
    description: string;
    category: 'document' | 'user' | 'area' | 'role' | 'settings';
}

const ALL_PERMISSIONS: PermissionOption[] = [
    { id: 'document.create', title: '📄 Crear Documentos y CITEs', description: 'Elaboración de Informes, Notas Internas, Cartas y Circulares', category: 'document' },
    { id: 'document.view.all', title: '👁️ Ver Toda la Correspondencia', description: 'Acceso a la totalidad de trámites de la oficina', category: 'document' },
    { id: 'document.view.own', title: '👤 Ver Solo Trámites Propios', description: 'Acceso exclusivo a documentos asignados a su usuario', category: 'document' },
    { id: 'document.derive', title: '📤 Derivar Documentos', description: 'Derivación oficial hacia otras dependencias y personal', category: 'document' },
    { id: 'document.approve', title: '✅ Aprobar y Dar Visto Bueno', description: 'Firma y aprobación formal de notas e informes', category: 'document' },
    { id: 'document.reject', title: '❌ Rechazar Solicitudes', description: 'Rechazo motivado de trámites por falta de requisitos', category: 'document' },
    { id: 'document.delete', title: '🗑️ Eliminar / Anular Registros', description: 'Dar de baja o anular trámites y Hojas de Ruta', category: 'document' },
    
    { id: 'user.manage', title: '👥 Gestionar Cuentas de Usuarios', description: 'Creación, modificación y deshabilitación de personal', category: 'user' },
    { id: 'user.view', title: '📋 Ver Directorio de Personal', description: 'Consulta del listado de funcionarios por unidad', category: 'user' },

    { id: 'area.manage', title: '🏢 Gestionar Organigrama y Áreas', description: 'Configuración de jerarquías y dependencias de la entidad', category: 'area' },
    { id: 'area.view', title: '🔍 Ver Estructura Organizacional', description: 'Consulta del mapa institucional de oficinas', category: 'area' },

    { id: 'role.manage', title: '🛡️ Administrar Roles por Oficina', description: 'Creación y personalización de permisos por perfil', category: 'role' },
    { id: 'role.view', title: '📜 Ver Matriz de Roles y Permisos', description: 'Consulta de perfiles y privilegios vigentes', category: 'role' },

    { id: 'organization.settings.manage', title: '⚙️ Configuración Institucional Global', description: 'Ajuste de parámetros globales de la organización', category: 'settings' },
];

const PERMISSION_LABEL_MAP: Record<string, string> = ALL_PERMISSIONS.reduce((acc, perm) => {
    acc[perm.id] = perm.title;
    return acc;
}, {} as Record<string, string>);

const LOCAL_STORAGE_KEY = 'gestordoc_custom_roles';

export default function RolesManagementPage() {
    const [selectedOffice, setSelectedOffice] = useState('Todas');
    const [rolesList, setRolesList] = useState<PersistentRoleItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleOffice, setNewRoleOffice] = useState('Oficina Nacional (La Paz)');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

    // Edit Role State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState('');
    const [editRoleName, setEditRoleName] = useState('');
    const [editRoleOffice, setEditRoleOffice] = useState('');
    const [editRoleDescription, setEditRoleDescription] = useState('');
    const [editSelectedPermissionIds, setEditSelectedPermissionIds] = useState<string[]>([]);

    const [successMessage, setSuccessMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const res = await fetchPersistentRoles();
            const serverData = res.data || [];
            let localData: PersistentRoleItem[] = [];
            if (typeof window !== 'undefined') {
                try {
                    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (stored) localData = JSON.parse(stored);
                } catch {
                    localData = [];
                }
            }

            // Merge server and local roles avoiding duplicates
            const combinedMap = new Map<string, PersistentRoleItem>();
            serverData.forEach(r => combinedMap.set(r.id, r));
            localData.forEach(r => combinedMap.set(r.id, r));

            setRolesList(Array.from(combinedMap.values()));
        } catch {
            setRolesList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const togglePermission = (permId: string, isEdit = false) => {
        if (isEdit) {
            setEditSelectedPermissionIds(prev =>
                prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
            );
        } else {
            setSelectedPermissionIds(prev =>
                prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
            );
        }
    };

    const handleSelectAllPermissions = (isEdit = false) => {
        if (isEdit) {
            if (editSelectedPermissionIds.length === ALL_PERMISSIONS.length) {
                setEditSelectedPermissionIds([]);
            } else {
                setEditSelectedPermissionIds(ALL_PERMISSIONS.map(p => p.id));
            }
        } else {
            if (selectedPermissionIds.length === ALL_PERMISSIONS.length) {
                setSelectedPermissionIds([]);
            } else {
                setSelectedPermissionIds(ALL_PERMISSIONS.map(p => p.id));
            }
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        try {
            setSubmitting(true);
            const res = await createPersistentRole(
                newRoleName,
                newRoleOffice,
                newRoleDescription,
                selectedPermissionIds
            );

            if (!res.success || !res.data) {
                setSuccessMessage(`Error al crear rol: ${res.error || 'Operación fallida'}`);
                return;
            }

            const newRole = res.data;
            if (typeof window !== 'undefined') {
                try {
                    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                    const currentLocal: PersistentRoleItem[] = stored ? JSON.parse(stored) : [];
                    const updatedLocal = [newRole, ...currentLocal.filter(r => r.id !== newRole.id)];
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocal));
                } catch {}
            }

            setSuccessMessage(`¡Rol "${newRole.name}" creado con éxito para ${newRoleOffice}!`);
            setIsCreateModalOpen(false);

            setNewRoleName('');
            setNewRoleDescription('');
            setSelectedPermissionIds([]);

            await loadRoles();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: any) {
            setSuccessMessage(`Error al crear rol: ${err?.message || 'Fallo inesperado'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEditModal = (role: PersistentRoleItem) => {
        setEditingRoleId(role.id);
        setEditRoleName(role.name);
        setEditRoleOffice(role.office);
        setEditRoleDescription(role.description);
        setEditSelectedPermissionIds([...role.permissions]);
        setIsEditModalOpen(true);
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRoleName.trim() || !editingRoleId) return;

        try {
            setSubmitting(true);
            const res = await updatePersistentRole(
                editingRoleId,
                editRoleName,
                editRoleOffice,
                editRoleDescription,
                editSelectedPermissionIds
            );

            if (!res.success || !res.data) {
                setSuccessMessage(`Error al actualizar rol: ${res.error || 'Operación fallida'}`);
                return;
            }

            const updated = res.data;
            if (typeof window !== 'undefined') {
                try {
                    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                    const currentLocal: PersistentRoleItem[] = stored ? JSON.parse(stored) : [];
                    const updatedLocal = currentLocal.map(r => r.id === editingRoleId ? updated : r);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocal));
                } catch {}
            }

            setSuccessMessage(`¡Rol "${updated.name}" actualizado exitosamente!`);
            setIsEditModalOpen(false);

            await loadRoles();
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: any) {
            setSuccessMessage(`Error al actualizar rol: ${err?.message || 'Fallo inesperado'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async (id: string, rName: string) => {
        if (!confirm(`¿Está seguro de eliminar el rol "${rName}"?`)) return;
        try {
            const res = await deletePersistentRole(id);
            if (typeof window !== 'undefined') {
                try {
                    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (stored) {
                        const currentLocal: PersistentRoleItem[] = JSON.parse(stored);
                        const updatedLocal = currentLocal.filter(r => r.id !== id && r.name !== rName);
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocal));
                    }
                } catch {}
            }
            if (res.success) {
                setSuccessMessage(`Rol "${rName}" eliminado.`);
            } else {
                setSuccessMessage(`Aviso: ${res.error || 'Se eliminó localmente'}`);
            }
            await loadRoles();
        } catch (err: any) {
            setSuccessMessage(`Error al eliminar: ${err?.message || 'Fallo inesperado'}`);
        }
    };

    const filteredRoles = selectedOffice === 'Todas' 
        ? rolesList 
        : rolesList.filter(r => r.office === selectedOffice);

    return (
        <SystemShell userRole="SUPERADMIN" userName="Super Usuario de Sistema">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Navbar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Gestión de Roles por Oficinas</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    🛡️ Módulo Super Usuario
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1">
                                Defina, edite y personalice roles con permisos estrictos en español para distintas dependencias institucionales.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full md:w-auto px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                        >
                            <span>+ Crear Nuevo Rol por Oficina</span>
                        </button>
                    </div>
                </div>

                {/* Notification alert */}
                {successMessage && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Filter and Office selector */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-300">Filtrar por Oficina / Dirección:</span>
                        <select
                            value={selectedOffice}
                            onChange={(e) => setSelectedOffice(e.target.value)}
                            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 outline-none"
                        >
                            <option value="Todas">Todas las Oficinas</option>
                            <option value="Oficina Nacional (La Paz)">Oficina Nacional (La Paz)</option>
                            <option value="Dirección Departamental Santa Cruz">Dirección Departamental Santa Cruz</option>
                            <option value="Dirección Departamental Cochabamba">Dirección Departamental Cochabamba</option>
                            <option value="Unidad Descentralizada Pando">Unidad Descentralizada Pando</option>
                        </select>
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                        Mostrando <span className="text-cyan-400 font-bold">{filteredRoles.length}</span> roles activos
                    </div>
                </div>

                {/* Roles Cards Grid */}
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-mono text-xs">Cargando roles registrados...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRoles.map((role) => (
                            <div key={role.id} className="glass-panel-glow p-6 rounded-3xl space-y-4 relative border border-slate-800 hover:border-cyan-500/40 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-white">{role.name}</h3>
                                            {role.isSystemRole && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-500/30">
                                                    Sistema
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-cyan-400 font-mono mt-1">📍 {role.office}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleOpenEditModal(role)}
                                            className="text-xs text-cyan-400 hover:text-white p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                                            title="Editar Rol y Permisos"
                                        >
                                            ✏️ Modificar
                                        </button>
                                        {!role.isSystemRole && (
                                            <button
                                                onClick={() => handleDeleteRole(role.id, role.name)}
                                                className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                                                title="Eliminar Rol"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {role.description}
                                </p>

                                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                                    <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                        Permisos Habilitados ({role.permissions.length}):
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.permissions.map(pId => (
                                            <span key={pId} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-cyan-300 border border-slate-700 shadow-sm">
                                                {PERMISSION_LABEL_MAP[pId] || pId}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Role Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-cyan-500/40 shadow-2xl animate-fadeIn">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <h3 className="text-xl font-bold text-white">Crear Nuevo Rol para Oficina</h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-slate-400 hover:text-white text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateRole} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Rol</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="Ej: SECRETARIA"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Oficina / Unidad Destino</label>
                                    <select
                                        value={newRoleOffice}
                                        onChange={(e) => setNewRoleOffice(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 outline-none"
                                    >
                                        <option value="Oficina Nacional (La Paz)">Oficina Nacional (La Paz)</option>
                                        <option value="Dirección Departamental Santa Cruz">Dirección Departamental Santa Cruz</option>
                                        <option value="Dirección Departamental Cochabamba">Dirección Departamental Cochabamba</option>
                                        <option value="Unidad Descentralizada Pando">Unidad Descentralizada Pando</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Descripción de Funciones</label>
                                    <textarea
                                        rows={2}
                                        value={newRoleDescription}
                                        onChange={(e) => setNewRoleDescription(e.target.value)}
                                        placeholder="Describa el propósito y alcance de este rol institucional..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                {/* Permissions Matrix */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">Asignación de Permisos Granulares:</label>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAllPermissions(false)}
                                            className="text-xs text-slate-300 hover:text-white underline font-semibold"
                                        >
                                            {selectedPermissionIds.length === ALL_PERMISSIONS.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-3 rounded-2xl bg-slate-950/80 border border-slate-800 no-scrollbar">
                                        {ALL_PERMISSIONS.map((perm) => {
                                            const isChecked = selectedPermissionIds.includes(perm.id);
                                            return (
                                                <label
                                                    key={perm.id}
                                                    onClick={() => togglePermission(perm.id)}
                                                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                                                        isChecked
                                                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md'
                                                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-xs text-white">{perm.title}</div>
                                                        <div className="text-[10px] text-slate-300 mt-0.5">{perm.description}</div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all"
                                    >
                                        {submitting ? 'Guardando...' : 'GUARDAR ROL'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Role Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <div className="w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-cyan-500/40 shadow-2xl animate-fadeIn">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <h3 className="text-xl font-bold text-white">✏️ Editar Rol y Permisos Granulares</h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-slate-400 hover:text-white text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleUpdateRole} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Rol</label>
                                    <input
                                        type="text"
                                        required
                                        value={editRoleName}
                                        onChange={(e) => setEditRoleName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Oficina / Unidad Destino</label>
                                    <select
                                        value={editRoleOffice}
                                        onChange={(e) => setEditRoleOffice(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 outline-none"
                                    >
                                        <option value="Oficina Nacional (La Paz)">Oficina Nacional (La Paz)</option>
                                        <option value="Dirección Departamental Santa Cruz">Dirección Departamental Santa Cruz</option>
                                        <option value="Dirección Departamental Cochabamba">Dirección Departamental Cochabamba</option>
                                        <option value="Unidad Descentralizada Pando">Unidad Descentralizada Pando</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Descripción de Funciones</label>
                                    <textarea
                                        rows={2}
                                        value={editRoleDescription}
                                        onChange={(e) => setEditRoleDescription(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                {/* Permissions Matrix */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">Modificar Permisos Asignados:</label>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAllPermissions(true)}
                                            className="text-xs text-slate-300 hover:text-white underline font-semibold"
                                        >
                                            {editSelectedPermissionIds.length === ALL_PERMISSIONS.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-3 rounded-2xl bg-slate-950/80 border border-slate-800 no-scrollbar">
                                        {ALL_PERMISSIONS.map((perm) => {
                                            const isChecked = editSelectedPermissionIds.includes(perm.id);
                                            return (
                                                <label
                                                    key={perm.id}
                                                    onClick={() => togglePermission(perm.id, true)}
                                                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                                                        isChecked
                                                            ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md'
                                                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-xs text-white">{perm.title}</div>
                                                        <div className="text-[10px] text-slate-300 mt-0.5">{perm.description}</div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 transition-all"
                                    >
                                        {submitting ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </SystemShell>
    );
}
