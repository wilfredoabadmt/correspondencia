import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { ChangePasswordUseCase } from './change-password.use-case';
import type { IUserRepository } from '../core/user.repository';

class MockUserRepository implements IUserRepository {
    findManyByOrganizationId = vi.fn();
    findById = vi.fn();
    findByEmail = vi.fn();
    create = vi.fn();
    update = vi.fn();
    delete = vi.fn();
    findHashedPasswordById = vi.fn();
    countAdminsByOrganizationId = vi.fn();
}

describe('ChangePasswordUseCase', () => {
    let useCase: ChangePasswordUseCase;
    let mockRepo: MockUserRepository;

    beforeEach(() => {
        mockRepo = new MockUserRepository();
        useCase = new ChangePasswordUseCase(mockRepo);
    });

    it('debe cambiar la contraseña exitosamente si la contraseña actual coincide', async () => {
        const hashedPass = await bcrypt.hash('secret123', 10);
        mockRepo.findHashedPasswordById.mockResolvedValue(hashedPass);

        await useCase.execute({
            userId: 'user-1',
            organizationId: 'org-1',
            currentPassword: 'secret123',
            newPassword: 'newSecret123',
        });

        expect(mockRepo.update).toHaveBeenCalledWith(
            'user-1',
            'org-1',
            expect.objectContaining({
                hashedPassword: expect.any(String),
            }),
            undefined
        );
    });

    it('debe lanzar un error si la contraseña actual es incorrecta', async () => {
        const hashedPass = await bcrypt.hash('secret123', 10);
        mockRepo.findHashedPasswordById.mockResolvedValue(hashedPass);

        await expect(
            useCase.execute({
                userId: 'user-1',
                organizationId: 'org-1',
                currentPassword: 'wrongPassword',
                newPassword: 'newSecret123',
            })
        ).rejects.toThrow('La contraseña actual es incorrecta.');
    });
});
