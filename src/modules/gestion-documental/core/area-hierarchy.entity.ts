/**
 * Represents the Area Hierarchy entity.
 * This is the shape of the object in our domain.
 */
export interface AreaHierarchy {
    id: string; // UUID
    organizationId: string; // ID of the Tenant
    code: string; // e.g., "DIR-GEN"
    name: string; // e.g., "Dirección General"
}