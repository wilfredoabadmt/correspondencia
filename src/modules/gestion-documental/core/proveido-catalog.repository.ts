import type { proveidoCatalog } from '@/db/schema';

export type Proveido = typeof proveidoCatalog.$inferSelect;

export interface IProveidoCatalogRepository {
    listByOrganization(organizationId: string): Promise<Proveido[]>;
    create(data: { organizationId: string; code: string; description: string }): Promise<Proveido>;
}
