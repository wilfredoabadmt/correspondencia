import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IPermissionRepository, Permission } from '../core/permission.repository';
import type { UserRole } from '~/modules/users/core/user.repository'; // Importar UserRole para tipado

type ListAvailablePermissionsUseCaseRequest = {
    organizationId: string; // Necesario para el contexto de seguridad, aunque no se use directamente en el repo de permisos
    userId: string; // Para auditoría o futuras comprobaciones de permisos más granulares
    userRole: UserRole; // Para control de autorización basado en roles
};

@injectable()
export class ListAvailablePermissionsUseCase {
    // Temporalmente, solo ADMINS pueden listar permisos.
    // Esto se reemplazará por la verificación de permisos (ej. 'role.view')
    // una vez que el AuthorizationService esté implementado.
    private readonly AUTHORIZED_ROLES: UserRole[] = ['ADMINISTRADOR'];

    constructor(
        @inject(InjectionTokens.PermissionRepository)
        private readonly permissionRepository: IPermissionRepository,
    ) { }

    async execute({ userRole }: ListAvailablePermissionsUseCaseRequest): Promise<Permission[]> {
        if (!this.AUTHORIZED_ROLES.includes(userRole)) {
            throw new Error(`Forbidden: User with role '${userRole}' is not authorized to list available permissions.`);
        }

        return this.permissionRepository.findAll();
    }
}