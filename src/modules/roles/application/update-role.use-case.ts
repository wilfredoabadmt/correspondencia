import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IRoleRepository, Role, RoleUpdateData } from '../core/role.repository';
import type { UserRole, IUserRepository } from '~/modules/users/core/user.repository';

type UpdateRoleUseCaseRequest = {
    id: string; // ID del rol a actualizar
    name?: string;
    permissionIds?: string[];
    organizationId: string;
    actingUserId: string; // ID del usuario que realiza la acción (ADMIN)
    actingUserRole: UserRole; // Rol del usuario que realiza la acción (ADMIN)
};

@injectable()
export class UpdateRoleUseCase {
    // Temporalmente, solo ADMINS pueden actualizar roles.
    // Esto se reemplazará por la verificación de permisos (ej. 'role.manage')
    // una vez que el AuthorizationService esté implementado.
    private readonly AUTHORIZED_ROLES: UserRole[] = ['ADMINISTRADOR'];
    private readonly CRITICAL_PERMISSIONS = ['role.manage', 'user.manage'];

    constructor(
        @inject(InjectionTokens.RoleRepository)
        private readonly roleRepository: IRoleRepository,
        @inject(InjectionTokens.UserRepository) // Inyectar UserRepository para obtener el rol del usuario que actúa
        private readonly userRepository: IUserRepository,
    ) { }

    async execute({
        id,
        name,
        permissionIds,
        organizationId,
        actingUserId,
        actingUserRole,
    }: UpdateRoleUseCaseRequest): Promise<Role | null> {
        // 1. Control de autorización basado en roles
        if (!this.AUTHORIZED_ROLES.includes(actingUserRole)) {
            throw new Error(`Forbidden: User with role '${actingUserRole}' is not authorized to update roles.`);
        }

        // Obtener el rol a actualizar para aplicar reglas de negocio
        const existingRole = await this.roleRepository.findById(id, organizationId);
        if (!existingRole) {
            return null; // Rol no encontrado o no pertenece a esta organización
        }

        // 2. Reglas de negocio
        // Rule: No permitirá renombrar roles de sistema (`isSystemRole = true`).
        if (existingRole.isSystemRole && name !== undefined && name !== existingRole.name) {
            throw new Error('Business Rule Violation: Cannot rename a system role.');
        }

        // Rule: No permitirá que un ADMINISTRADOR se quite a sí mismo permisos críticos
        // que le impidan administrar el sistema (ej. `role.manage`, `user.manage`).
        if (permissionIds !== undefined) {
            const actingUser = await this.userRepository.findById(actingUserId, organizationId);
            if (actingUser && actingUser.roleId === id) { // Si el rol a actualizar es el rol actual del usuario
                const currentPermissions = new Set(existingRole.permissions.map(p => p.id));
                const newPermissions = new Set(permissionIds);

                for (const criticalPerm of this.CRITICAL_PERMISSIONS) {
                    if (currentPermissions.has(criticalPerm) && !newPermissions.has(criticalPerm)) {
                        throw new Error(`Business Rule Violation: Cannot remove critical permission '${criticalPerm}' from your own role.`);
                    }
                }
            }
        }

        // 3. Actualizar el rol
        const updateData: RoleUpdateData = {};
        if (name !== undefined) updateData.name = name;
        if (permissionIds !== undefined) updateData.permissionIds = permissionIds;

        if (Object.keys(updateData).length === 0) {
            return existingRole; // No hay nada que actualizar, devolver el rol actual
        }

        return this.roleRepository.update(id, organizationId, updateData);
    }
}