import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRepository } from '../core/user.repository';
import type {
    AssignRoleInput,
    AssignRoleOutput,
    IAssignRoleUseCase,
} from './assign-role.use-case';

export class AuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

@injectable()
export class AssignRoleUseCase implements IAssignRoleUseCase {
    constructor(
        @inject(InjectionTokens.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(input: AssignRoleInput): Promise<AssignRoleOutput> {
        const { actorId, targetUserId, newRole } = input;

        const actor = await this.userRepository.findById(actorId);
        if (!actor || actor.role !== 'ADMINISTRADOR') {
            throw new AuthorizationError('Only administrators can assign roles.');
        }

        const targetUser = await this.userRepository.findById(targetUserId);
        if (!targetUser) {
            throw new Error(`User with ID ${targetUserId} not found.`);
        }

        if (actor.organizationId !== targetUser.organizationId) {
            throw new AuthorizationError(
                'Administrators can only assign roles to users within their own organization.'
            );
        }

        const updatedUser = await this.userRepository.updateRole(targetUserId, newRole);

        if (!updatedUser) {
            throw new Error(`Failed to update role for user with ID ${targetUserId}.`);
        }

        const { hashedPassword, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}