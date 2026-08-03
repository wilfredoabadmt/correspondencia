'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<'credentials' | 'roles'>('roles');
    const [organizationId, setOrganizationId] = useState('org_12345');
    const [email, setEmail] = useState('superadmin@gestordoc.gob.bo');
    const [password, setPassword] = useState('••••••••');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedRole, setSelectedRole] = useState<'SUPERADMIN' | 'ADMINISTRADOR' | 'OPERADOR'>('SUPERADMIN');

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'OPERADOR') {
            setSelectedRole('OPERADOR');
            setEmail('opA1@example.com');
            setActiveTab('roles');
        } else if (roleParam === 'ADMINISTRADOR') {
            setSelectedRole('ADMINISTRADOR');
            setEmail('adminA@example.com');
            setActiveTab('roles');
        } else if (roleParam === 'SUPERADMIN') {
            setSelectedRole('SUPERADMIN');
            setEmail('superadmin@gestordoc.gob.bo');
            setActiveTab('roles');
        }
    }, [searchParams]);

    const handleQuickRoleSelect = (role: 'SUPERADMIN' | 'ADMINISTRADOR' | 'OPERADOR') => {
        setSelectedRole(role);
        if (role === 'SUPERADMIN') {
            setEmail('superadmin@gestordoc.gob.bo');
        } else if (role === 'ADMINISTRADOR') {
            setEmail('adminA@example.com');
        } else {
            setEmail('opA1@example.com');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    organizationId,
                    role: selectedRole,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Credenciales inválidas');
            }

            // Redirect based on role
            if (selectedRole === 'SUPERADMIN') {
                router.push('/admin/roles');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl border border-cyan-500/30">
                {/* Header */}
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
                            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-2xl font-bold tracking-wider text-white">Gestor<span className="text-gradient-cyan">Doc</span></span>
                    </Link>
                    <h2 className="text-lg font-bold text-white">Portal de Acceso SIGEC</h2>
                    <p className="text-xs text-slate-300">Seleccione su perfil de acceso o credenciales oficiales</p>
                </div>

                {/* Tabs */}
                <div className="mt-5 p-1 rounded-xl bg-slate-900 border border-slate-800 flex">
                    <button
                        type="button"
                        onClick={() => setActiveTab('roles')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'roles'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        ⚡ Demo por Roles
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('credentials')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'credentials'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        🔐 Credenciales
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                    {/* Organization Selector */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Organización / Entidad</label>
                        <select
                            value={organizationId}
                            onChange={(e) => setOrganizationId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 outline-none"
                        >
                            <option value="org_12345">Organización A (Oficina Nacional)</option>
                            <option value="org_2">Organización B (Dirección Departamental)</option>
                            <option value="org_3">Organización C (Unidad Descentralizada)</option>
                        </select>
                    </div>

                    {/* Fast Role Selectors */}
                    {activeTab === 'roles' && (
                        <div className="space-y-2 pt-1">
                            <label className="block text-xs font-medium text-slate-300">Seleccionar Perfil de Demostración:</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuickRoleSelect('SUPERADMIN')}
                                    className={`p-2.5 rounded-xl border text-center transition-all ${
                                        selectedRole === 'SUPERADMIN'
                                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="text-[11px] font-bold">👑 SUPER</div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">Crear Roles</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleQuickRoleSelect('ADMINISTRADOR')}
                                    className={`p-2.5 rounded-xl border text-center transition-all ${
                                        selectedRole === 'ADMINISTRADOR'
                                            ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300 shadow-md'
                                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="text-[11px] font-bold">🛡️ ADMIN</div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">Gerencia</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleQuickRoleSelect('OPERADOR')}
                                    className={`p-2.5 rounded-xl border text-center transition-all ${
                                        selectedRole === 'OPERADOR'
                                            ? 'bg-blue-600/20 border-cyan-400 text-cyan-300 shadow-md'
                                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="text-[11px] font-bold">👤 OPERADOR</div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">Trámites</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@aevivienda.gob.bo"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 outline-none"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-slate-300">Contraseña</label>
                            <span className="text-[10px] text-cyan-400 hover:underline cursor-pointer">¿Olvidó clave?</span>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 outline-none pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                            >
                                {showPassword ? '👁️‍🗨️' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                <span>Autenticando...</span>
                            </>
                        ) : (
                            <>
                                <span>Ingresar al Sistema ({selectedRole})</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-3 border-t border-slate-800/80 text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>🔒 TLS 1.3 Encriptado</span>
                        <span>•</span>
                        <span>Multi-Tenant Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LoginForm() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md mx-auto p-8 rounded-3xl glass-panel text-center text-slate-300 text-sm">
                Cargando portal de acceso...
            </div>
        }>
            <LoginFormContent />
        </Suspense>
    );
}
