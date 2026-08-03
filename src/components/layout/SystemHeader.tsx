'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SystemHeaderProps = {
    userRole?: string;
    userName?: string;
    userEmail?: string;
    organizationId?: string;
};

export function SystemHeader({
    userRole = 'OPERADOR',
    userName = 'Usuario',
    userEmail = '',
    organizationId = 'org_12345',
}: SystemHeaderProps) {
    const pathname = usePathname();

    const isAdminOrSuper = userRole === 'SUPERADMIN' || userRole === 'ADMINISTRADOR';

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/inbox/incoming', label: 'Entrante', icon: '📥' },
        { href: '/inbox/pending', label: 'Pendientes', icon: '⏳' },
        { href: '/inbox/sent', label: 'Enviados', icon: '📤' },
        { href: '/inbox/archived', label: 'Archivados', icon: '🗄️' },
        { href: '/dashboard/expedientes', label: 'Expedientes', icon: '📂' },
        { href: '/documents', label: 'Documentos', icon: '📝' },
        { href: '/reports', label: 'Reportes', icon: '📈' },
        ...(isAdminOrSuper
            ? [
                { href: '/admin/users', label: 'Usuarios', icon: '👥' },
                { href: '/admin/roles', label: 'Roles', icon: '🛡️', badge: userRole === 'SUPERADMIN' ? 'SUPER' : 'ADMIN' },
            ]
            : []),
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-md shadow-blue-500/20">
                        <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold tracking-wider text-white">Gestor<span className="text-gradient-cyan">Doc</span></span>
                        <span className="text-[9px] uppercase tracking-wider font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                            SIGEC
                        </span>
                    </div>
                </Link>

                {/* Top Nav Items (Desktop Tabs) */}
                <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                                }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout Button */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col text-right">
                        <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[140px]">{userName}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                userRole === 'SUPERADMIN'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : userRole === 'ADMINISTRADOR'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                                {userRole}
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{userEmail || 'usuario@gestordoc.gob.bo'}</span>
                    </div>

                    {/* Direct Logout Button to Landing */}
                    <a
                        href="/api/auth/logout"
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5 shadow-sm"
                        title="Cerrar sesión y volver a la Landing Page"
                    >
                        <span>🚪</span>
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </a>
                </div>
            </div>

            {/* Mobile Nav Scrollable Strip */}
            <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/60 bg-slate-950/80">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
                                isActive
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                                    : 'text-slate-300 hover:bg-slate-900'
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </header>
    );
}
