import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import { getSemaphoreInfo } from '~/lib/deadline.utils';
import type { IDocumentRepository } from '../core/document.repository';

export interface GenerateReportDTO {
    organizationId: string;
    startDate?: string | null;
    endDate?: string | null;
    status?: string | null;
    destinationAreaId?: string | null;
    documentType?: string | null;
}

export interface ReportItem {
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

export interface ReportResult {
    documents: ReportItem[];
    summary: {
        totalDocuments: number;
        pendingCount: number;
        receivedCount: number;
        overdueCount: number;
    };
}

@injectable()
export class GenerateReportUseCase {
    constructor(
        @inject(InjectionTokens.DocumentRepository)
        private readonly documentRepository: IDocumentRepository
    ) {}

    async execute(dto: GenerateReportDTO): Promise<ReportResult> {
        const result = await this.documentRepository.findMany({
            organizationId: dto.organizationId,
            page: 1,
            pageSize: 500,
            status: dto.status || undefined,
        });

        const documents: ReportItem[] = result.data.map((doc) => {
            const startDate = doc.receptionDate || doc.createdAt;
            const semaphore = getSemaphoreInfo(startDate);

            return {
                id: doc.id,
                trackingCode: doc.trackingCode || doc.trackingId || 'SN',
                subject: doc.subject || 'Sin Asunto',
                sender: doc.sender || 'Remitente',
                destinationAreaName: (doc as any).destinationAreaName || 'Área Destino',
                status: doc.status || 'Registrado',
                documentType: doc.documentType || 'Informe',
                receptionDate: doc.receptionDate,
                createdAt: doc.createdAt ?? new Date(),
                daysElapsed: semaphore.daysElapsed,
                semaphoreLevel: semaphore.level,
            };
        });

        const totalDocuments = documents.length;
        const pendingCount = documents.filter((d) => d.status === 'Recibido' || d.status === 'PENDIENTE_RECEPCION').length;
        const receivedCount = documents.filter((d) => d.status === 'Recibido').length;
        const overdueCount = documents.filter((d) => d.daysElapsed >= 5).length;

        return {
            documents,
            summary: {
                totalDocuments,
                pendingCount,
                receivedCount,
                overdueCount,
            },
        };
    }
}
