import { inject, injectable } from 'tsyringe';

import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository, User, UserRole, UserUpdateData } from '../core/user.repository';

type UpdateUserUseCaseRequest = {
    id: string; // ID del usuario a actualizar
    name?: string;
    role?: UserRole;
    organizationId: string;
    actingUserId: string; // ID del usuario que realiza la acción (ADMIN)
    actingUserRole: string; // Rol del usuario que realiza la acción (ADMIN)
};

@injectable()
export class UpdateUserUseCase {
    private readonly AUTHORIZED_ROLES = ['ADMINISTRADOR', 'SUPERADMIN'];

    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute({
        id,
        name,
        role,
        organizationId,
        actingUserId,
        actingUserRole,
    }: UpdateUserUseCaseRequest): Promise<User | null> {
        // 1. Control de autorización basado en roles
        if (!this.AUTHORIZED_ROLES.includes(actingUserRole)) {
            throw new Error(`Forbidden: User with role '${actingUserRole}' is not authorized to update users.`);
        }

        // 2. Reglas de negocio específicas para la actualización de roles
        if (role && role !== 'ADMINISTRADOR' && role !== 'SUPERADMIN') {
            // No permitir cambiar el rol de un ADMIN a OPERADOR si es el último ADMIN
            const targetUser = await this.userRepository.findById(id, organizationId);
            if (targetUser && (targetUser.role === 'ADMINISTRADOR' || targetUser.role === 'SUPERADMIN')) {
                const adminCount = await this.userRepository.countAdminsByOrganizationId(organizationId);
                if (adminCount <= 1) {
                    throw new Error('Business Rule Violation: Cannot change the role of the last ADMIN in the organization.');
                }
            }
        }

        // 3. Actualizar el usuario
        const updateData: UserUpdateData = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;

        if (Object.keys(updateData).length === 0) {
            return this.userRepository.findById(id, organizationId);
        }

        return this.userRepository.update(id, organizationId, updateData);
    }
}