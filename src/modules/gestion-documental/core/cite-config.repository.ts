import type { citeConfigs } from '@/db/schema';

export type CiteConfig = typeof citeConfigs.$inferSelect;

export type FindCiteConfigParams = {
    organizationId: string;
    areaId?: string | null;
    documentType?: string | null;
    year: number;
};

export type UpsertCiteConfigParams = {
    id?: string;
    organizationId: string;
    areaId?: string | null;
    documentType?: string | null;
    formatPattern: string;
    currentSequence?: number;
    year: number;
    resetYearly?: boolean;
};

export interface ICiteConfigRepository {
    findByParams(params: FindCiteConfigParams): Promise<CiteConfig | null>;
    listByOrganization(organizationId: string): Promise<CiteConfig[]>;
    upsert(params: UpsertCiteConfigParams): Promise<CiteConfig>;
    incrementSequence(id: string): Promise<number>;
}
