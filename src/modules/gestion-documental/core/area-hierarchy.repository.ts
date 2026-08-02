import { AreaHierarchy } from './area-hierarchy.entity';

/**
 * Defines the contract for data persistence for the AreaHierarchy entity.
 */
export interface IAreaHierarchyRepository {
    /**
     * Finds the code for a given area hierarchy ID.
     * @param id The UUID of the area hierarchy.
     * @returns A promise that resolves to the area code string or null if not found.
     */
    findCodeById(id: string): Promise<string | null>;

    /**
     * Creates a new Area Hierarchy.
     * @param data The data for the new area.
     * @returns A promise that resolves to the created area.
     */
    create(data: {
        name: string;
        code: string;
        organizationId: string;
    }): Promise<AreaHierarchy>;

    /**
     * Lists all Area Hierarchies for a given organization.
     * @param organizationId The ID of the organization.
     * @returns A promise that resolves to an array of areas.
     */
    listByOrg(organizationId: string): Promise<AreaHierarchy[]>;

    /**
     * Updates an existing Area Hierarchy.
     * @param id The ID of the area to update.
     * @param organizationId The ID of the organization to ensure ownership.
     * @param data The data to update.
     * @returns A promise that resolves to the updated area or null if not found.
     */
    update(
        id: string,
        organizationId: string,
        data: Partial<{ name: string; code: string }>
    ): Promise<AreaHierarchy | null>;

    /**
     * Deletes an Area Hierarchy.
     * The implementation must check for dependencies before deleting.
     * @param id The ID of the area to delete.
     * @param organizationId The ID of the organization to ensure ownership.
     * @returns A promise that resolves when the operation is complete.
     */
    delete(id: string, organizationId: string): Promise<void>;
}