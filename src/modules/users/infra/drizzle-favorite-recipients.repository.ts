import { inject, injectable } from 'tsyringe';
import { and, eq } from 'drizzle-orm';
import type { DB } from '@/core/db/db.di';
import { InjectionTokens } from '~/core/injection-tokens';
import * as schema from '@/db/schema';
import type {
    IFavoriteRecipientsRepository,
    FavoriteRecipient,
    FavoriteRecipientWithAreaName,
} from '../core/favorite-recipients.repository';

@injectable()
export class DrizzleFavoriteRecipientsRepository implements IFavoriteRecipientsRepository {
    constructor(@inject(InjectionTokens.DB) private readonly db: DB) {}

    async addFavorite(params: {
        userId: string;
        targetAreaId: string;
        organizationId: string;
        alias?: string | null;
    }): Promise<FavoriteRecipient> {
        const [inserted] = await this.db
            .insert(schema.favoriteRecipients)
            .values({
                userId: params.userId,
                targetAreaId: params.targetAreaId,
                organizationId: params.organizationId,
                alias: params.alias,
            })
            .returning();

        return inserted!;
    }

    async removeFavorite(params: { id: string; userId: string; organizationId: string }): Promise<void> {
        await this.db
            .delete(schema.favoriteRecipients)
            .where(
                and(
                    eq(schema.favoriteRecipients.id, params.id),
                    eq(schema.favoriteRecipients.userId, params.userId),
                    eq(schema.favoriteRecipients.organizationId, params.organizationId)
                )
            );
    }

    async findUserFavorites(params: { userId: string; organizationId: string }): Promise<FavoriteRecipientWithAreaName[]> {
        const rows = await this.db
            .select({
                id: schema.favoriteRecipients.id,
                userId: schema.favoriteRecipients.userId,
                targetAreaId: schema.favoriteRecipients.targetAreaId,
                organizationId: schema.favoriteRecipients.organizationId,
                alias: schema.favoriteRecipients.alias,
                createdAt: schema.favoriteRecipients.createdAt,
                targetAreaName: schema.areaHierarchy.name,
            })
            .from(schema.favoriteRecipients)
            .innerJoin(
                schema.areaHierarchy,
                eq(schema.favoriteRecipients.targetAreaId, schema.areaHierarchy.id)
            )
            .where(
                and(
                    eq(schema.favoriteRecipients.userId, params.userId),
                    eq(schema.favoriteRecipients.organizationId, params.organizationId)
                )
            );

        return rows;
    }
}
