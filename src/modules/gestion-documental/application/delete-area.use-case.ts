/**
 * Input Data Transfer Object for deleting an area.
 */
export interface DeleteAreaInput {
    organizationId: string;
    areaId: string;
}

export interface IDeleteAreaUseCase {
    execute(input: DeleteAreaInput): Promise<void>;
}