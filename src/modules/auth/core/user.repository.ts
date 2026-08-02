import { Role, User } from './user.entity';

export interface IUserRepository {
    /**
     * Finds a user by their email within a specific organization.
     * @param email The user's email.
     * @param organizationId The ID of the organization.
     * @returns A promise that resolves to the User object or null if not found.
     */
    findByEmail(email: string, organizationId: string): Promise<User | null>;

    /**
     * Finds a user by their ID.
     * @param userId The user's ID.
     * @returns A promise that resolves to the User object or null if not found.
     */
    findById(userId: string): Promise<User | null>;

    /**
     * Updates the role of a specific user.
     * @param userId The ID of the user to update.
     * @param role The new role to assign.
     * @returns A promise that resolves to the updated User object or null if not found.
     */
    updateRole(userId: string, role: Role): Promise<User | null>;
}