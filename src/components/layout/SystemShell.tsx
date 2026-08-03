'use client';

import React from 'react';
import { SystemHeader } from './SystemHeader';

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
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 bg-futuristic-grid flex flex-col selection:bg-cyan-500 selection:text-slate-950">
            {/* Top Navigation Header */}
            <SystemHeader
                userRole={userRole}
                userName={userName}
                userEmail={userEmail}
                organizationId={organizationId}
            />

            {/* Main Workspace Area (100% Width) */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
