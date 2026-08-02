import { AreaHierarchy } from '../core/area-hierarchy.entity';

/**
 * Input Data Transfer Object for updating an area.
 */
export interface UpdateAreaInput {
    organizationId: string;
    areaId: string;
    data: Partial<{
        name: string;
        code: string;
    }>;
}

export interface IUpdateAreaUseCase {
    execute(input: UpdateAreaInput): Promise<AreaHierarchy>;
}