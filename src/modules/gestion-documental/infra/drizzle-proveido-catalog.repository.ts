import { inject, injectable } from 'tsyringe';
import { eq } from 'drizzle-orm';
import type { DB } from '@/core/db/db.di';
import * as schema from '@/db/schema';
import type { IProveidoCatalogRepository, Proveido } from '../core/proveido-catalog.repository';
import { InjectionTokens } from '~/core/injection-tokens';

const DEFAULT_PROVEIDOS = [
    { code: 'PROV-01', description: 'Para su atención y fines pertinentes' },
    { code: 'PROV-02', description: 'Análisis e Informe' },
    { code: 'PROV-03', description: 'Para su conocimiento y archivo' },
    { code: 'PROV-04', description: 'Dar curso a lo solicitado' },
    { code: 'PROV-05', description: 'Preparar respuesta u oficio' },
];

@injectable()
export class DrizzleProveidoCatalogRepository implements IProveidoCatalogRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) { }

    async listByOrganization(organizationId: string): Promise<Proveido[]> {
        const rows = await this.db
            .select()
            .from(schema.proveidoCatalog)
            .where(eq(schema.proveidoCatalog.organizationId, organizationId));

        if (rows.length > 0) {
            return rows;
        }

        // Auto-seed default proveídos for tenant
        const seeded: Proveido[] = [];
        for (const item of DEFAULT_PROVEIDOS) {
            const [created] = await this.db
                .insert(schema.proveidoCatalog)
                .values({
                    organizationId,
                    code: item.code,
                    description: item.description,
                    isActive: true,
                })
                .returning();
            if (created) seeded.push(created);
        }

        return seeded;
    }

    async create(data: { organizationId: string; code: string; description: string }): Promise<Proveido> {
        const [created] = await this.db
            .insert(schema.proveidoCatalog)
            .values({
                organizationId: data.organizationId,
                code: data.code,
                description: data.description,
                isActive: true,
            })
            .returning();

        return created;
    }
}
