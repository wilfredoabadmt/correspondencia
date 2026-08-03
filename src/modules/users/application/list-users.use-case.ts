import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository, User } from '../core/user.repository';

type ListUsersUseCaseRequest = {
    organizationId: string;
    userId: string; // Para auditoría o futuras comprobaciones de permisos más granulares
    userRole: string; // Para control de autorización basado en roles
};

@injectable()
export class ListUsersUseCase {
    private readonly AUTHORIZED_ROLES = ['ADMINISTRADOR', 'SUPERADMIN'];

    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute({ organizationId, userRole }: ListUsersUseCaseRequest): Promise<User[]> {
        // 1. Control de autorización basado en roles
        if (!this.AUTHORIZED_ROLES.includes(userRole)) {
            throw new Error(`Forbidden: User with role '${userRole}' is not authorized to list users.`);
        }

        // 2. Obtener la lista de usuarios de la organización
        return this.userRepository.findManyByOrganizationId(organizationId);
    }
}