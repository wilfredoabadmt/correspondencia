'use server';

import { auth } from '~/modules/auth/lib/auth';
import { redirect } from 'next/navigation';
import { container, InjectionTokens } from '~/core/container';
import type { IStorageService } from '~/modules/storage/core/storage.service';

const CONFIG_KEY = 'routing-slip/config.json';
const LOGO_KEY = 'routing-slip/logo';

export interface RoutingSlipConfig {
    institutionName: string;
    subTitle: string;
    headerColor: string;
    logoKey?: string | null;
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

const DEFAULT_CONFIG: RoutingSlipConfig = {
    institutionName: 'AGENCIA ESTATAL DE VIVIENDA - AEVIVIENDA',
    subTitle: 'MINISTERIO DE OBRAS PÚBLICAS, SERVICIOS Y VIVIENDA',
    headerColor: '#0f172a',
    logoKey: null,
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

function getStorageService(): IStorageService | null {
    try {
        return container.resolve<IStorageService>(InjectionTokens.StorageService);
    } catch (e) {
        console.error('[routing-slip-config] Failed to resolve StorageService from container:', e);
        return null;
    }
}

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

async function loadConfigFromR2(): Promise<RoutingSlipConfig> {
    try {
        const storage = getStorageService();
        if (!storage) return DEFAULT_CONFIG;
        const buf = await storage.getFileBuffer(CONFIG_KEY);
        return JSON.parse(buf.toString('utf-8'));
    } catch {
        return DEFAULT_CONFIG;
    }
}

async function saveConfigToR2(config: RoutingSlipConfig): Promise<void> {
    const storage = getStorageService();
    if (!storage) throw new Error('R2 Storage no está configurado');
    const body = Buffer.from(JSON.stringify(config, null, 2), 'utf-8');
    await storage.uploadFile(CONFIG_KEY, body, 'application/json');
}

export async function getRoutingSlipConfig(): Promise<RoutingSlipConfig> {
    await checkAdminAuth();
    return loadConfigFromR2();
}

export async function getRoutingSlipConfigPublic(): Promise<RoutingSlipConfig> {
    return loadConfigFromR2();
}

export async function saveRoutingSlipConfig(formData: FormData): Promise<RoutingSlipConfig> {
    await checkAdminAuth();

    const current = await loadConfigFromR2();

    const institutionName = formData.get('institutionName') as string || current.institutionName;
    const subTitle = formData.get('subTitle') as string || current.subTitle;

    const citeInf = formData.get('citeInf') as string || current.citeFormats.INF;
    const citeNot = formData.get('citeNot') as string || current.citeFormats.NOT;
    const citeCar = formData.get('citeCar') as string || current.citeFormats.CAR;
    const citeMem = formData.get('citeMem') as string || current.citeFormats.MEM;
    const citeCir = formData.get('citeCir') as string || current.citeFormats.CIR;
    const citeIns = formData.get('citeIns') as string || current.citeFormats.INS;

    // Upload logo to R2 if provided
    let logoKey = current.logoKey;
    const logoFile = formData.get('logoFile') as File | null;
    if (logoFile && logoFile.size > 0) {
        try {
            const storage = getStorageService();
            if (storage) {
                const buffer = Buffer.from(await logoFile.arrayBuffer());
                const ext = logoFile.name.split('.').pop() || 'png';
                logoKey = `${LOGO_KEY}.${ext}`;
                await storage.uploadFile(logoKey, buffer, logoFile.type || 'image/png');
            }
        } catch (e) {
            console.error('[saveRoutingSlipConfig] Failed to upload logo to R2:', e);
        }
    }

    const config: RoutingSlipConfig = {
        institutionName,
        subTitle,
        headerColor: '#0f172a',
        logoKey,
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

    try {
        await saveConfigToR2(config);
    } catch (e) {
        console.error('[saveRoutingSlipConfig] Failed to save config to R2:', e);
        throw new Error('No se pudo guardar en R2. Verifique las credenciales del bucket.');
    }

    return config;
}

export async function getRoutingSlipLogoUrl(): Promise<string | null> {
    const config = await loadConfigFromR2();
    if (!config.logoKey) return null;
    const storage = getStorageService();
    if (!storage) return null;
    return storage.getDownloadUrl(config.logoKey);
}
