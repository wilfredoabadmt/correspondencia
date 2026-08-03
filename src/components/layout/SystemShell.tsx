'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';

type SystemShellProps = {
    children: React.ReactNode;
    userRole?: string;
    userName?: string;
    userEmail?: string;
    organizationId?: string;
};

export function SystemShell({
    children,
    userRole = 'OPERADOR',
    userName = 'Usuario Autenticado',
    userEmail = 'usuario@aevivienda.gob.bo',
    organizationId = 'org_12345',
}: SystemShellProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 bg-futuristic-grid flex overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-screen sticky top-0">
                <Sidebar
                    userRole={userRole}
                    userName={userName}
                    userEmail={userEmail}
                    organizationId={organizationId}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    <div className="relative z-10 w-64 h-full">
                        <Sidebar
                            userRole={userRole}
                            userName={userName}
                            userEmail={userEmail}
                            organizationId={organizationId}
                        />
                    </div>
                </div>
            )}

            {/* Main Content Workspace Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Top Mobile Bar */}
                <div className="md:hidden sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 p-4 flex items-center justify-between backdrop-blur-md">
                    <button
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="text-sm font-bold text-white tracking-wider flex items-center gap-1">
                        Gestor<span className="text-gradient-cyan">Doc</span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {userRole}
                    </span>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
