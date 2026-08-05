import * as React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import { auth } from '~/modules/auth/lib/auth';
import type { ListAreasUseCase } from '~/modules/gestion-documental/application/list-areas.use-case.impl';
import { VentanillaRegistrationForm } from '~/modules/gestion-documental/components/ventanilla-registration-form';
import { SystemShell } from '~/components/layout/SystemShell';

export const metadata: Metadata = {
    title: 'Ventanilla Única de Recepción Externa | GestorDoc',
    description: 'Registro presencial y digital de trámites ciudadanos con comprobante QR.',
};

export default async function VentanillaPage() {
    const session = await auth();
    if (!session?.user?.organizationId) {
        redirect('/login');
    }

    const user = session.user;
    const listAreasUseCase = container.resolve<ListAreasUseCase>(
        InjectionTokens.ListAreasUseCase
    );

    const areas = await listAreasUseCase.execute({
        organizationId: user.organizationId,
    }).catch(() => []);

    return (
        <SystemShell
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            organizationId={user.organizationId}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Ventanilla Única de Recepción Externa</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                        Registre documentación ingresada por ciudadanos o instituciones externas y emita el Comprobante Oficial de Recepción.
                    </p>
                </div>

                <VentanillaRegistrationForm areas={areas} />
            </div>
        </SystemShell>
    );
}
