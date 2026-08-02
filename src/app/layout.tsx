import type { Metadata } from 'next';
import * as React from 'react';
import './globals.css';

export const metadata: Metadata = {
    title: 'GestorDoc - Sistema de Gestión Documental',
    description: 'Sistema de gestión documental y correspondencia institucional',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="min-h-screen bg-background font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
