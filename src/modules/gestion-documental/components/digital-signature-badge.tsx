import * as React from 'react';

type DigitalSignatureBadgeProps = {
    isSigned?: boolean | null;
    verificationCode?: string | null;
    signedAt?: Date | string | null;
};

export function DigitalSignatureBadge({ isSigned, verificationCode, signedAt }: DigitalSignatureBadgeProps) {
    if (!isSigned) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pendiente de Firma Digital
            </span>
        );
    }

    const formattedDate = signedAt
        ? new Date(signedAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    return (
        <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Firmado Digitalmente
            </span>
            {verificationCode && (
                <a
                    href={`/verificar/${verificationCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 dark:text-emerald-400 font-mono hover:underline flex items-center gap-1"
                >
                    Código: {verificationCode} ↗
                </a>
            )}
        </div>
    );
}
