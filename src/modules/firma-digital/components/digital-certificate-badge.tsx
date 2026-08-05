'use client';

import * as React from 'react';

type DigitalCertificateBadgeProps = {
    isSigned: boolean;
    signedAt?: Date | string | null;
    signedByUserName?: string | null;
    signatureHash?: string | null;
    verificationCode?: string | null;
    signedCertificateSubject?: string | null;
    signedCertificateIssuer?: string | null;
    timestampAuthority?: string | null;
    timestampedAt?: Date | string | null;
};

export function DigitalCertificateBadge({
    isSigned,
    signedAt,
    signedByUserName,
    signatureHash,
    verificationCode,
    signedCertificateSubject,
    signedCertificateIssuer,
    timestampAuthority,
    timestampedAt,
}: DigitalCertificateBadgeProps) {
    if (!isSigned) {
        return (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Sin Firma Digital Registrada</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 bg-emerald-950/20 border border-emerald-800/60 rounded-3xl space-y-3 text-xs shadow-lg">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2.5">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="font-bold text-emerald-200">Firma Digital Válida (PAdES / Jacobitus)</h4>
                </div>
                {verificationCode && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {verificationCode}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                    <span className="text-slate-400">Titular del Certificado:</span>
                    <p className="text-slate-200 font-semibold truncate mt-0.5">
                        {signedCertificateSubject || signedByUserName || 'Servidor Público Autorizado'}
                    </p>
                </div>
                <div>
                    <span className="text-slate-400">Entidad Certificadora (CA):</span>
                    <p className="text-emerald-300 font-semibold truncate mt-0.5">
                        {signedCertificateIssuer || 'ADSIB - Entidad Certificadora Pública'}
                    </p>
                </div>
                <div>
                    <span className="text-slate-400">Sello de Tiempo (TSA RFC 3161):</span>
                    <p className="text-slate-200 font-medium truncate mt-0.5">
                        {timestampAuthority || 'TSA Oficial AGETIC/ADSIB'}
                    </p>
                </div>
                <div>
                    <span className="text-slate-400">Fecha/Hora Certificada:</span>
                    <p className="text-slate-200 font-medium mt-0.5">
                        {timestampedAt ? new Date(timestampedAt).toLocaleString('es-BO') : signedAt ? new Date(signedAt).toLocaleString('es-BO') : 'Certificado'}
                    </p>
                </div>
            </div>

            {signatureHash && (
                <div className="pt-2 border-t border-emerald-900/40 font-mono text-[10px] text-slate-400 truncate">
                    Hash SHA-256: <span className="text-emerald-400">{signatureHash}</span>
                </div>
            )}
        </div>
    );
}
