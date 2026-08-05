export type UserRoleAssignment = {
    userId: string;
    roleId: string;
    roleName?: string;
};

export interface IUserRoleAssignmentRepository {
    getUserRoles(userId: string, organizationId: string): Promise<UserRoleAssignment[]>;
    assignUserRoles(params: {
        userId: string;
        organizationId: string;
        roleIds: string[];
        jobTitle?: string | null;
    }): Promise<void>;
}
