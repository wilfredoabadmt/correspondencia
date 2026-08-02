'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '~/modules/users/core/user.repository';

const ADMIN_ROLES: UserRole[] = ['ADMINISTRADOR'];

type SidebarProps = {
    userRole?: UserRole;
};

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard' },
        { href: '/documents', label: 'Documentos' },
        { href: '/admin/users', label: 'Gestión de Usuarios', requiredRoles: ADMIN_ROLES },
    ];

    return (
        <aside className="w-64 bg-gray-800 text-white p-4 h-full">
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const isAuthorized = !item.requiredRoles || (userRole && item.requiredRoles.includes(userRole));

                    if (!isAuthorized) {
                        return null;
                    }

                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium ${
                                isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}