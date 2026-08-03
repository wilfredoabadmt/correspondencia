'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = {
    userRole?: string;
    userName?: string;
    userEmail?: string;
    organizationId?: string;
};

export function Sidebar({ userRole = 'OPERADOR', userName = 'Usuario', userEmail = '', organizationId = 'org_12345' }: SidebarProps) {
    const pathname = usePathname();

    const isAdminOrSuper = userRole === 'SUPERADMIN' || userRole === 'ADMINISTRADOR';

    const menuSections = [
        {
            title: 'PANEL PRINCIPAL',
            items: [
                { href: '/dashboard', label: 'Inicio / Dashboard', icon: '📊' },
            ],
        },
        {
            title: 'BANDEJAS DE TRÁMITES',
            items: [
                { href: '/inbox/incoming', label: 'Correspondencia Entrante', icon: '📥' },
                { href: '/inbox/pending', label: 'Bandeja Pendientes', icon: '⏳' },
                { href: '/inbox/sent', label: 'Bandeja Enviados', icon: '📤' },
                { href: '/inbox/archived', label: 'Correspondencia Archivada', icon: '🗄️' },
            ],
        },
        {
            title: 'GESTIÓN DOCUMENTAL',
            items: [
                { href: '/dashboard/expedientes', label: 'Expedientes Virtuales', icon: '📂' },
                { href: '/documents', label: 'Generar / Ver Documentos', icon: '📝' },
                { href: '/reports', label: 'Reportes Gerenciales', icon: '📈' },
            ],
        },
        ...(isAdminOrSuper ? [{
            title: 'ADMINISTRACIÓN INSTITUCIONAL',
            items: [
                { href: '/admin/users', label: 'Gestión de Usuarios', icon: '👥' },
                { href: '/admin/roles', label: 'Roles por Oficina', icon: '🛡️', badge: userRole === 'SUPERADMIN' ? 'SUPER' : 'ADMIN' },
                { href: '/admin/templates', label: 'Plantillas Word (.docx)', icon: '📜', badge: 'SUPER' },
            ],
        }] : []),
        {
            title: 'MI CUENTA',
            items: [
                { href: '/profile', label: 'Perfil & Destinatarios', icon: '👤' },
                { href: '/', label: 'Ver Landing Page', icon: '🌐' },
            ],
        },
    ];

    return (
        <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between h-full backdrop-blur-2xl shrink-0 selection:bg-cyan-500 text-slate-100 shadow-2xl">
            {/* Top Brand Header */}
            <div>
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
                            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <div className="text-base font-extrabold text-white tracking-wider flex items-center gap-1">
                                Gestor<span className="text-gradient-cyan">Doc</span>
                            </div>
                            <div className="text-[10px] text-slate-300 font-mono">SIGEC v2.4</div>
                        </div>
                    </Link>
                </div>

                {/* User Active Card Badge */}
                <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300">Usuario Activo</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            userRole === 'SUPERADMIN' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : userRole === 'ADMINISTRADOR'
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}>
                            {userRole}
                        </span>
                    </div>
                    <div className="text-xs font-extrabold text-white truncate mt-1">{userName}</div>
                    <div className="text-[10px] text-slate-300 font-mono truncate">{userEmail || 'usuario@aevivienda.gob.bo'}</div>
                </div>

                {/* Menu Sections with HIDDEN SCROLLBAR (no-scrollbar) */}
                <nav className="p-3 space-y-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-210px)]">
                    {menuSections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            <div className="px-2.5 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                                {section.title}
                            </div>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-white border border-cyan-500/50 font-bold shadow-md shadow-cyan-950/40'
                                                : 'text-slate-200 hover:text-white hover:bg-slate-900/80 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-sm">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Logout Button linking to Landing */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950">
                <a
                    href="/api/auth/logout"
                    className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <span>🚪 Cerrar Sesión</span>
                </a>
            </div>
        </aside>
    );
}