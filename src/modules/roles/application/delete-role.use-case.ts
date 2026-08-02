import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IRoleRepository } from '../core/role.repository';
import type { UserRole } from '~/modules/users/core/user.repository'; // Import UserRole para tipado

type DeleteRoleUseCaseRequest = {
    id: string; // ID del rol a eliminar
    organizationId: string;
    actingUserId: string; // ID del usuario que realiza la acción (ADMIN)
    actingUserRole: UserRole; // Rol del usuario que realiza la acción (ADMIN)
};

@injectable()
export class DeleteRoleUseCase {
    // Temporalmente, solo ADMINS pueden eliminar roles.
    // Esto se reemplazará por la verificación de permisos (ej. 'role.manage')
    // una vez que el AuthorizationService esté implementado.
    private readonly AUTHORIZED_ROLES: UserRole[] = ['ADMINISTRADOR'];

    constructor(
        @inject(InjectionTokens.RoleRepository)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute({
        id,
        organizationId,
        actingUserRole,
    }: DeleteRoleUseCaseRequest): Promise<void> {
        // 1. Control de autorización basado en roles
        if (!this.AUTHORIZED_ROLES.includes(actingUserRole)) {
            throw new Error(`Forbidden: User with role '${actingUserRole}' is not authorized to delete roles.`);
        }

        // Obtener el rol a eliminar para aplicar reglas de negocio
        const existingRole = await this.roleRepository.findById(id, organizationId);
        if (!existingRole) {
            // Si el rol no existe o no pertenece a la organización, simplemente no hacemos nada
            // o podríamos lanzar un error específico si la UI necesita saberlo.
            // Para eliminación, no hacer nada es a menudo un comportamiento aceptable (idempotente).
            return;
        }

        // 2. Reglas de negocio
        // Rule: No permitirá eliminar roles de sistema (`isSystemRole = true`).
        if (existingRole.isSystemRole) {
            throw new Error('Business Rule Violation: Cannot delete a system role.');
        }

        // Rule: Un rol no podrá ser eliminado si está actualmente asignado a algún usuario.
        const usersWithRoleCount = await this.roleRepository.countUsersWithRole(id);
        if (usersWithRoleCount > 0) {
            throw new Error('Business Rule Violation: Cannot delete a role that is currently assigned to users.');
        }

        // 3. Eliminar el rol
        await this.roleRepository.delete(id, organizationId);
    }
}