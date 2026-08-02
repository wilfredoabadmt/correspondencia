import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IRoleRepository, Role } from '../core/role.repository';
import type { UserRole } from '~/modules/users/core/user.repository'; // Importar UserRole para tipado

type ListRolesUseCaseRequest = {
    organizationId: string;
    userId: string; // Para auditoría o futuras comprobaciones de permisos más granulares
    userRole: UserRole; // Para control de autorización basado en roles
};

@injectable()
export class ListRolesUseCase {
    // Temporalmente, solo ADMINS pueden listar roles.
    // Esto se reemplazará por la verificación de permisos (ej. 'role.view')
    // una vez que el AuthorizationService esté implementado.
    private readonly AUTHORIZED_ROLES: UserRole[] = ['ADMINISTRADOR'];

    constructor(
        @inject(InjectionTokens.RoleRepository)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async execute({ organizationId, userRole }: ListRolesUseCaseRequest): Promise<Role[]> {
        if (!this.AUTHORIZED_ROLES.includes(userRole)) {
            throw new Error(`Forbidden: User with role '${userRole}' is not authorized to list roles.`);
        }

        return this.roleRepository.findManyByOrganizationId(organizationId);
    }
}