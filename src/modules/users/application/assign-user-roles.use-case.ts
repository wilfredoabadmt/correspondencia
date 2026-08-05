import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { IUserRoleAssignmentRepository } from '../core/user-role-assignment.repository';

export type AssignUserRolesInput = {
    userId: string;
    organizationId: string;
    roleIds: string[];
    jobTitle?: string | null;
};

@injectable()
export class AssignUserRolesUseCase {
    constructor(
        @inject(InjectionTokens.UserRoleAssignmentRepository)
        private readonly userRoleAssignmentRepository: IUserRoleAssignmentRepository
    ) { }

    async execute(input: AssignUserRolesInput): Promise<void> {
        if (!input.userId || !input.organizationId) {
            throw new Error('Identificador de usuario y organización son requeridos.');
        }

        await this.userRoleAssignmentRepository.assignUserRoles({
            userId: input.userId,
            organizationId: input.organizationId,
            roleIds: input.roleIds,
            jobTitle: input.jobTitle,
        });
    }
}
