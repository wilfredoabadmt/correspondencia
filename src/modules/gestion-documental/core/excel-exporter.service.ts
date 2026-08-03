export interface ReportExportDocumentItem {
    trackingCode: string;
    subject: string;
    sender: string;
    destinationAreaName: string;
    status: string;
    documentType: string;
    receptionDateStr: string;
    daysElapsed: number;
}

export interface ReportExportData {
    organizationName: string;
    startDateStr?: string;
    endDateStr?: string;
    documents: ReportExportDocumentItem[];
    summary: {
        totalDocuments: number;
        pendingCount: number;
        receivedCount: number;
        overdueCount: number;
    };
}

export interface IExcelExporterService {
    generateReportSpreadsheet(data: ReportExportData): Promise<Buffer>;
}
