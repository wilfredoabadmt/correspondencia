import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IFavoriteRecipientsRepository, FavoriteRecipientWithAreaName } from '../core/favorite-recipients.repository';

export interface AddFavoriteDTO {
    userId: string;
    targetAreaId: string;
    organizationId: string;
    alias?: string | null;
}

export interface RemoveFavoriteDTO {
    id: string;
    userId: string;
    organizationId: string;
}

@injectable()
export class ManageFavoritesUseCase {
    constructor(
        @inject(InjectionTokens.FavoriteRecipientsRepository)
        private readonly repository: IFavoriteRecipientsRepository
    ) {}

    async getFavorites(userId: string, organizationId: string): Promise<FavoriteRecipientWithAreaName[]> {
        return this.repository.findUserFavorites({ userId, organizationId });
    }

    async add(dto: AddFavoriteDTO): Promise<void> {
        await this.repository.addFavorite(dto);
    }

    async remove(dto: RemoveFavoriteDTO): Promise<void> {
        await this.repository.removeFavorite(dto);
    }
}
