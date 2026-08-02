import { AreaHierarchy } from '../core/area-hierarchy.entity';

/**
 * Input Data Transfer Object for creating a new area.
 */
export interface CreateAreaInput {
    organizationId: string;
    name: string;
    code: string;
}

export interface ICreateAreaUseCase {
    execute(input: CreateAreaInput): Promise<AreaHierarchy>;
}