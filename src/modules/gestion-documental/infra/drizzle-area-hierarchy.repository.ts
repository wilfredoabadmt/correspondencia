import { and, asc, eq, ne } from 'drizzle-orm';
import { injectable } from 'tsyringe';
import { db } from '~/db';
import * as schema from '~/db/schema';
import type { AreaHierarchy } from '../core/area-hierarchy.entity';
import type { IAreaHierarchyRepository } from '../core/area-hierarchy.repository';

@injectable()
export class DrizzleAreaHierarchyRepository implements IAreaHierarchyRepository {
    async findCodeById(id: string): Promise<string | null> {
        const result = await db
            .select({ code: schema.areaHierarchies.code })
            .from(schema.areaHierarchies)
            .where(eq(schema.areaHierarchies.id, id))
            .limit(1);

        return result.length > 0 ? result[0].code : null;
    }

    async create(data: {
        name: string;
        code: string;
        organizationId: string;
    }): Promise<AreaHierarchy> {
        const existing = await db
            .select({ id: schema.areaHierarchies.id })
            .from(schema.areaHierarchies)
            .where(
                and(
                    eq(schema.areaHierarchies.organizationId, data.organizationId),
                    eq(schema.areaHierarchies.code, data.code)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            throw new Error(
                `Area with code "${data.code}" already exists in this organization.`
            );
        }

        const [newArea] = await db
            .insert(schema.areaHierarchies)
            .values(data)
            .returning();

        return newArea as AreaHierarchy;
    }

    async listByOrg(organizationId: string): Promise<AreaHierarchy[]> {
        const areas = await db
            .select()
            .from(schema.areaHierarchies)
            .where(eq(schema.areaHierarchies.organizationId, organizationId))
            .orderBy(asc(schema.areaHierarchies.name));
        return areas as AreaHierarchy[];
    }

    async update(
        id: string,
        organizationId: string,
        data: Partial<{ name: string; code: string }>
    ): Promise<AreaHierarchy | null> {
        if (data.code) {
            const existing = await db
                .select({ id: schema.areaHierarchies.id })
                .from(schema.areaHierarchies)
                .where(
                    and(
                        eq(schema.areaHierarchies.organizationId, organizationId),
                        eq(schema.areaHierarchies.code, data.code),
                        ne(schema.areaHierarchies.id, id)
                    )
                )
                .limit(1);

            if (existing.length > 0) {
                throw new Error(
                    `Area with code "${data.code}" already exists in this organization.`
                );
            }
        }

        const [updatedArea] = await db
            .update(schema.areaHierarchies)
            .set(data)
            .where(
                and(
                    eq(schema.areaHierarchies.id, id),
                    eq(schema.areaHierarchies.organizationId, organizationId)
                )
            )
            .returning();

        return (updatedArea as AreaHierarchy) ?? null;
    }

    async delete(id: string, organizationId: string): Promise<void> {
        const existingDocument = await db
            .select({ id: schema.documents.id })
            .from(schema.documents)
            .where(eq(schema.documents.areaHierarchyId, id))
            .limit(1);

        if (existingDocument.length > 0) {
            throw new Error(
                'This area is in use by at least one document and cannot be deleted.'
            );
        }

        await db.delete(schema.areaHierarchies).where(
            and(
                eq(schema.areaHierarchies.id, id),
                eq(schema.areaHierarchies.organizationId, organizationId)
            )
        );
    }
}