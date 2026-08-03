'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PermissionOption {
    id: string;
    label: string;
    category: 'document' | 'user' | 'area' | 'role' | 'settings';
}

const ALL_PERMISSIONS: PermissionOption[] = [
    { id: 'document.create', label: 'Crear nuevos documentos y CITEs', category: 'document' },
    { id: 'document.view.all', label: 'Ver todos los documentos de la oficina', category: 'document' },
    { id: 'document.view.own', label: 'Ver solo documentos asignados a su usuario', category: 'document' },
    { id: 'document.derive', label: 'Derivar documentos a otras áreas / personas', category: 'document' },
    { id: 'document.approve', label: 'Aprobar documentos y dar Visto Bueno', category: 'document' },
    { id: 'document.reject', label: 'Rechazar solicitudes con justificación', category: 'document' },
    { id: 'document.delete', label: 'Eliminar o anular documentos', category: 'document' },
    
    { id: 'user.manage', label: 'Crear, editar y dar de baja usuarios', category: 'user' },
    { id: 'user.view', label: 'Ver listado de personal por unidad', category: 'user' },

    { id: 'area.manage', label: 'Gestionar organigrama y jerarquías de área', category: 'area' },
    { id: 'area.view', label: 'Ver estructura organizacional de la entidad', category: 'area' },

    { id: 'role.manage', label: 'Crear y editar roles de usuario por oficina', category: 'role' },
    { id: 'role.view', label: 'Ver matriz de roles y sus permisos', category: 'role' },

    { id: 'organization.settings.manage', label: 'Configurar parámetros globales de entidad', category: 'settings' },
];

interface RoleItem {
    id: string;
    name: string;
    office: string;
    isSystemRole: boolean;
    permissions: string[];
    description: string;
}

export default function RolesManagementPage() {
    const [selectedOffice, setSelectedOffice] = useState('Todas');
    const [rolesList, setRolesList] = useState<RoleItem[]>([
        {
            id: 'role-1',
            name: 'SUPERADMIN (Administrador Global)',
            office: 'Oficina Nacional (La Paz)',
            isSystemRole: true,
            description: 'Control absoluto del sistema, creación de organizaciones y administración global de roles.',
            permissions: ALL_PERMISSIONS.map(p => p.id),
        },
        {
            id: 'role-2',
            name: 'ADMINISTRADOR DE OFICINA',
            office: 'Oficina Nacional (La Paz)',
            isSystemRole: true,
            description: 'Administración de usuarios, áreas y monitoreo gerencial de la Oficina Nacional.',
            permissions: ['document.create', 'document.view.all', 'document.derive', 'user.manage', 'user.view', 'area.manage', 'role.view'],
        },
        {
            id: 'role-3',
            name: 'OPERADOR DE VENTANILLA',
            office: 'Oficina Nacional (La Paz)',
            isSystemRole: false,
            description: 'Recepción de correspondencia externa, asignación de CITEs e impresión de Hojas de Ruta.',
            permissions: ['document.create', 'document.view.own', 'document.derive', 'user.view', 'area.view'],
        },
        {
            id: 'role-4',
            name: 'DIRECTOR DE PLANIFICACIÓN',
            office: 'Dirección Departamental Santa Cruz',
            isSystemRole: false,
            description: 'Supervisión de informes técnicos, aprobación de notas internas y derivación prioritaria.',
            permissions: ['document.create', 'document.view.all', 'document.derive', 'document.approve', 'document.reject', 'user.view', 'area.view'],
        },
    ]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleOffice, setNewRoleOffice] = useState('Oficina Nacional (La Paz)');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState('');

    const togglePermission = (permId: string) => {
        setSelectedPermissionIds(prev =>
            prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
        );
    };

    const handleSelectAllPermissions = () => {
        if (selectedPermissionIds.length === ALL_PERMISSIONS.length) {
            setSelectedPermissionIds([]);
        } else {
            setSelectedPermissionIds(ALL_PERMISSIONS.map(p => p.id));
        }
    };

    const handleCreateRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        const newRole: RoleItem = {
            id: `role-${Date.now()}`,
            name: newRoleName.trim().toUpperCase(),
            office: newRoleOffice,
            isSystemRole: false,
            description: newRoleDescription || 'Rol personalizado asignado por Super Usuario.',
            permissions: selectedPermissionIds,
        };

        setRolesList([newRole, ...rolesList]);
        setSuccessMessage(`¡Rol "${newRole.name}" creado con éxito para ${newRoleOffice}!`);
        setIsCreateModalOpen(false);

        // Reset form
        setNewRoleName('');
        setNewRoleDescription('');
        setSelectedPermissionIds([]);

        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const handleDeleteRole = (id: string) => {
        setRolesList(rolesList.filter(r => r.id !== id));
    };

    const filteredRoles = selectedOffice === 'Todas' 
        ? rolesList 
        : rolesList.filter(r => r.office === selectedOffice);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 bg-futuristic-grid py-8 px-4 sm:px-6 lg:px-8">
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
                                Defina y personalice roles con permisos estritos para distintas dependencias y personal institucional.
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

                                {!role.isSystemRole && (
                                    <button
                                        onClick={() => handleDeleteRole(role.id)}
                                        className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                                        title="Eliminar Rol"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                {role.description}
                            </p>

                            <div className="pt-3 border-t border-slate-800/80 space-y-2">
                                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                    Permisos Asignados ({role.permissions.length}):
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {role.permissions.map(pId => (
                                        <span key={pId} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                                            {pId}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Rol (Ej: RESPONSABLE_ARCHIVADO)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="Ej: JEFE DE UNIDAD JURÍDICA"
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
                                        placeholder="Describa el propósito y alcance de este rol..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                {/* Permissions Matrix */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-cyan-400">Selección de Permisos Granulares:</label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllPermissions}
                                            className="text-xs text-slate-300 hover:text-white underline"
                                        >
                                            {selectedPermissionIds.length === ALL_PERMISSIONS.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                        {ALL_PERMISSIONS.map((perm) => {
                                            const isChecked = selectedPermissionIds.includes(perm.id);
                                            return (
                                                <label
                                                    key={perm.id}
                                                    onClick={() => togglePermission(perm.id)}
                                                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                                                        isChecked
                                                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                                                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                                                    />
                                                    <div>
                                                        <div className="font-mono font-bold text-[11px]">{perm.id}</div>
                                                        <div className="text-[10px] text-slate-400">{perm.label}</div>
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
                                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all"
                                    >
                                        Guardar Rol
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
