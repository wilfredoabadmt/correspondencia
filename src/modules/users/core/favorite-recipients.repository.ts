import type { favoriteRecipients } from '@/db/schema';

export type FavoriteRecipient = typeof favoriteRecipients.$inferSelect;

export interface FavoriteRecipientWithAreaName extends FavoriteRecipient {
    targetAreaName: string;
}

export interface IFavoriteRecipientsRepository {
    addFavorite(params: {
        userId: string;
        targetAreaId: string;
        organizationId: string;
        alias?: string | null;
    }): Promise<FavoriteRecipient>;

    removeFavorite(params: {
        id: string;
        userId: string;
        organizationId: string;
    }): Promise<void>;

    findUserFavorites(params: {
        userId: string;
        organizationId: string;
    }): Promise<FavoriteRecipientWithAreaName[]>;
}
