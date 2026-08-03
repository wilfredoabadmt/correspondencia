'use server';

import { auth } from '~/modules/auth/lib/auth';
import { redirect } from 'next/navigation';

export interface RoutingSlipConfig {
    institutionName: string;
    subTitle: string;
    headerColor: string;
    logoUrl?: string | null;
    citeFormats: {
        INF: string;
        NOT: string;
        CAR: string;
        MEM: string;
        CIR: string;
        INS: string;
    };
    updatedAt?: string;
}

let ROUTING_SLIP_CONFIG_STORE: RoutingSlipConfig = {
    institutionName: 'AGENCIA ESTATAL DE VIVIENDA - AEVIVIENDA',
    subTitle: 'MINISTERIO DE OBRAS PÚBLICAS, SERVICIOS Y VIVIENDA',
    headerColor: '#0f172a',
    logoUrl: null,
    citeFormats: {
        INF: 'AEV/DNP/INF/Nro.{SEQ}-{YEAR}',
        NOT: 'AEV/DNP/NOT/Nro.{SEQ}-{YEAR}',
        CAR: 'AEV/DNP/CAR/Nro.{SEQ}-{YEAR}',
        MEM: 'AEV/DNP/MEM/Nro.{SEQ}-{YEAR}',
        CIR: 'AEV/DNP/CIR/Nro.{SEQ}-{YEAR}',
        INS: 'AEV/DNP/INS/Nro.{SEQ}-{YEAR}',
    },
    updatedAt: new Date().toISOString(),
};

async function checkAdminAuth() {
    const session = await auth();
    if (!session?.user?.organizationId) {
        redirect('/login');
    }
    const role = (session.user as any).role || 'OPERADOR';
    if (role !== 'SUPERADMIN' && role !== 'ADMINISTRADOR') {
        redirect('/dashboard');
    }
    return session.user;
}

export async function getRoutingSlipConfig(): Promise<RoutingSlipConfig> {
    await checkAdminAuth();
    return ROUTING_SLIP_CONFIG_STORE;
}

export async function saveRoutingSlipConfig(formData: FormData): Promise<RoutingSlipConfig> {
    await checkAdminAuth();

    const institutionName = formData.get('institutionName') as string || ROUTING_SLIP_CONFIG_STORE.institutionName;
    const subTitle = formData.get('subTitle') as string || ROUTING_SLIP_CONFIG_STORE.subTitle;
    
    const citeInf = formData.get('citeInf') as string || ROUTING_SLIP_CONFIG_STORE.citeFormats.INF;
    const citeNot = formData.get('citeNot') as string || ROUTING_SLIP_CONFIG_STORE.citeFormats.NOT;
    const citeCar = formData.get('citeCar') as string || ROUTING_SLIP_CONFIG_STORE.citeFormats.CAR;
    const citeMem = formData.get('citeMem') as string || ROUTING_SLIP_CONFIG_STORE.citeFormats.MEM;
    const citeCir = formData.get('citeCir') as string || ROUTING_SLIP_CONFIG_STORE.citeFormats.CIR;
    const citeIns = formData.get('citeIns') as string || ROUTING_SLIP_CONFIG_STORE.citeFormats.INS;

    const logoFile = formData.get('logoFile') as File | null;
    let logoUrl = ROUTING_SLIP_CONFIG_STORE.logoUrl;
    if (logoFile && logoFile.size > 0) {
        logoUrl = `data:image/png;base64,demo_logo_${Date.now()}`;
    }

    ROUTING_SLIP_CONFIG_STORE = {
        institutionName,
        subTitle,
        headerColor: '#0f172a',
        logoUrl,
        citeFormats: {
            INF: citeInf,
            NOT: citeNot,
            CAR: citeCar,
            MEM: citeMem,
            CIR: citeCir,
            INS: citeIns,
        },
        updatedAt: new Date().toISOString(),
    };

    return ROUTING_SLIP_CONFIG_STORE;
}
