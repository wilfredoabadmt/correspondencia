import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository } from '../core/user.repository';

type DeleteUserUseCaseRequest = {
    id: string; // ID del usuario a eliminar
    organizationId: string;
    actingUserId: string; // ID del usuario que realiza la acción (ADMIN/SUPERADMIN)
    actingUserRole: string; // Rol del usuario que realiza la acción (ADMIN/SUPERADMIN)
};

@injectable()
export class DeleteUserUseCase {
    private readonly AUTHORIZED_ROLES = ['ADMINISTRADOR', 'SUPERADMIN'];

    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute({
        id,
        organizationId,
        actingUserId,
        actingUserRole,
    }: DeleteUserUseCaseRequest): Promise<void> {
        // 1. Control de autorización basado en roles
        if (!this.AUTHORIZED_ROLES.includes(actingUserRole)) {
            throw new Error(`Forbidden: User with role '${actingUserRole}' is not authorized to delete users.`);
        }

        // 2. Reglas de negocio específicas para la eliminación
        if (id === actingUserId) {
            throw new Error('Business Rule Violation: An ADMIN cannot delete themselves.');
        }

        // 3. Eliminar el usuario
        await this.userRepository.delete(id, organizationId);
    }
}