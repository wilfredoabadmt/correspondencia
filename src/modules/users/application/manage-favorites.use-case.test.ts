import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageFavoritesUseCase } from './manage-favorites.use-case';
import type { IFavoriteRecipientsRepository } from '../core/favorite-recipients.repository';

class MockFavoritesRepository implements IFavoriteRecipientsRepository {
    addFavorite = vi.fn();
    removeFavorite = vi.fn();
    findUserFavorites = vi.fn();
}

describe('ManageFavoritesUseCase', () => {
    let useCase: ManageFavoritesUseCase;
    let mockRepo: MockFavoritesRepository;

    beforeEach(() => {
        mockRepo = new MockFavoritesRepository();
        useCase = new ManageFavoritesUseCase(mockRepo);
    });

    it('debe listar los favoritos del usuario', async () => {
        mockRepo.findUserFavorites.mockResolvedValue([
            {
                id: 'fav-1',
                userId: 'user-1',
                targetAreaId: 'area-1',
                targetAreaName: 'Dirección General',
                organizationId: 'org-1',
                alias: 'DG',
                createdAt: new Date(),
            },
        ]);

        const result = await useCase.getFavorites('user-1', 'org-1');
        expect(result.length).toBe(1);
        expect(result[0]?.targetAreaName).toBe('Dirección General');
    });
});
