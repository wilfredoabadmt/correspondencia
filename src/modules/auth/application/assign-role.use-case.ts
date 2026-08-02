import { Role, User } from '../core/user.entity';

/**
 * Input Data Transfer Object for assigning a role to a user.
 */
export interface AssignRoleInput {
    actorId: string; // The user performing the action
    targetUserId: string; // The user whose role is being changed
    newRole: Role;
}

/**
 * The output of a successful role assignment, excluding sensitive data.
 */
export type AssignRoleOutput = Omit<User, 'hashedPassword'>;

export interface IAssignRoleUseCase {
    execute(input: AssignRoleInput): Promise<AssignRoleOutput>;
}