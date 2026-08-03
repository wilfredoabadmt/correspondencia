/**
 * @file Contrato para el repositorio de datos del Dashboard.
 */

/**
 * Representa un documento reciente para ser mostrado en el dashboard.
 * Contiene solo los campos necesarios para la UI.
 */
export type RecentDocument = {
    id: string;
    trackingId: string;
    subject: string;
    receptionDate: Date;
};

export type DashboardKpis = {
    documentsToday: number;
    pendingDocuments: number;
    totalDocuments: number;
    overdueDocuments: number;
};

export interface IDashboardRepository {
    getKpis(params: { organizationId: string }): Promise<DashboardKpis>;
    getRecentDocuments(params: { organizationId: string; limit: number }): Promise<RecentDocument[]>;
}