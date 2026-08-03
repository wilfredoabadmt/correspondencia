# Modelo de Datos y Parámetros de Reportes: Feature 015

## 1. DTO de Filtros de Reportes (`ReportQueryParams`)

```typescript
export interface ReportQueryParams {
    organizationId: string;
    startDate?: string | null;
    endDate?: string | null;
    status?: string | null;
    destinationAreaId?: string | null;
    documentType?: string | null;
}
```

---

## 2. DTO de Resultado del Reporte (`ReportDataResult`)

```typescript
export interface ReportDocumentItem {
    id: string;
    trackingCode: string;
    subject: string;
    sender: string;
    destinationAreaName: string;
    status: string;
    documentType: string;
    receptionDate: Date | null;
    createdAt: Date;
    daysElapsed: number;
    semaphoreLevel: 'NORMAL' | 'WARNING' | 'OVERDUE';
}

export interface ReportSummaryStats {
    totalDocuments: number;
    pendingCount: number;
    receivedCount: number;
    overdueCount: number;
}

export interface ReportDataResult {
    documents: ReportDocumentItem[];
    summary: ReportSummaryStats;
}
```
