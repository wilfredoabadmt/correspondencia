import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IRoleRepository, Role, RoleInsertData } from '../core/role.repository';
import type { UserRole } from '~/modules/users/core/user.repository'; // Import UserRole para tipado

type CreateRoleUseCaseRequest = {
    name: string;
    permissionIds: string[];
    organizationId: string;
    actingUserId: string; // ID del usuario que realiza la acción (ADMIN)
    actingUserRole: UserRole; // Rol del usuario que realiza la acción (ADMIN)
};

@injectable()
export class CreateRoleUseCase {
    // Temporalmente, solo ADMINS pueden crear roles.
    // Esto se reemplazará por la verificación de permisos (ej. 'role.manage')
    // una vez que el AuthorizationService esté implementado.
    private readonly AUTHORIZED_ROLES: UserRole[] = ['ADMINISTRADOR'];

    constructor(
        @inject(InjectionTokens.RoleRepository)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute({
        name,
        permissionIds,
        organizationId,
        actingUserRole,
    }: CreateRoleUseCaseRequest): Promise<Role> {
        // 1. Control de autorización basado en roles
        if (!this.AUTHORIZED_ROLES.includes(actingUserRole)) {
            throw new Error(`Forbidden: User with role '${actingUserRole}' is not authorized to create roles.`);
        }

        // 2. Validar unicidad del nombre del rol dentro de la organización
        const existingRole = await this.roleRepository.findByName(name, organizationId);
        if (existingRole) {
            throw new Error('Validation Error: A role with this name already exists in this organization.');
        }

        // 3. Crear el rol
        const roleData: RoleInsertData = {
            name,
            organizationId,
            permissionIds,
            isSystemRole: false, // Los roles creados por el ADMIN no son de sistema por defecto
        };

        return this.roleRepository.create(roleData);
    }
}