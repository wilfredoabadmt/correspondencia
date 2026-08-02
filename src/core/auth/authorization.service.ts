import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository } from '~/modules/users/core/user.repository';
import type { IRoleRepository } from '~/modules/roles/core/role.repository';

@injectable()
export class AuthorizationService {
    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(InjectionTokens.RoleRepository)
        private readonly roleRepository: IRoleRepository,
    ) { }

    async hasPermission(
        userId: string,
        organizationId: string,
        permission: string,
    ): Promise<boolean> {
        const user = await this.userRepository.findById(userId, organizationId);
        if (!user || !user.roleId) {
            return false;
        }

        const role = await this.roleRepository.findById(user.roleId, organizationId);
        if (!role) {
            return false;
        }

        return role.permissions.some((p) => p.id === permission);
    }
}