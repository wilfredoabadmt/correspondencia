import { AreaHierarchy } from '../core/area-hierarchy.entity';

/**
 * Input Data Transfer Object for listing areas.
 */
export interface ListAreasInput {
    organizationId: string;
}

export interface IListAreasUseCase {
    execute(input: ListAreasInput): Promise<AreaHierarchy[]>;
}