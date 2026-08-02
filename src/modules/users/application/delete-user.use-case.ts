import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository } from '../core/user.repository';

type DeleteUserUseCaseRequest = {
    id: string; // ID del usuario a eliminar
    organizationId: string;
    actingUserId: string; // ID del usuario que realiza la acción (ADMIN)
    actingUserRole: string; // Rol del usuario que realiza la acción (ADMIN)
};

@injectable()
export class DeleteUserUseCase {
    private readonly AUTHORIZED_ROLES = ['ADMINISTRADOR'];

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
        // No permitir que un ADMIN se elimine a sí mismo
        if (id === actingUserId) {
            throw new Error('Business Rule Violation: An ADMIN cannot delete themselves.');
        }

        // No permitir la eliminación del último ADMIN de la organización
        const adminCount = await this.userRepository.countAdminsByOrganizationId(organizationId);
        const targetUser = await this.userRepository.findById(id, organizationId);
        if (targetUser && targetUser.role === 'ADMINISTRADOR' && adminCount <= 1) {
            throw new Error('Business Rule Violation: Cannot delete the last ADMIN in the organization.');
        }

        // 3. Eliminar el usuario
        await this.userRepository.delete(id, organizationId);
    }
}