import { inject, injectable } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository } from '../core/user.repository';

export interface ChangePasswordDTO {
    userId: string;
    organizationId: string;
    currentPassword?: string;
    newPassword?: string;
}

@injectable()
export class ChangePasswordUseCase {
    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository
    ) {}

    async execute({ userId, organizationId, currentPassword, newPassword }: ChangePasswordDTO): Promise<void> {
        if (!currentPassword || !newPassword) {
            throw new Error('Debe proporcionar la contraseña actual y la nueva contraseña.');
        }

        if (newPassword.length < 6) {
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
        }

        const hashedPassword = this.userRepository.findHashedPasswordById
            ? await this.userRepository.findHashedPasswordById(userId, organizationId)
            : null;
        if (!hashedPassword) {
            throw new Error('Usuario no encontrado.');
        }

        const isValid = await bcrypt.compare(currentPassword, hashedPassword);
        if (!isValid) {
            throw new Error('La contraseña actual es incorrecta.');
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(userId, organizationId, {
            hashedPassword: newHashedPassword,
        });
    }
}
