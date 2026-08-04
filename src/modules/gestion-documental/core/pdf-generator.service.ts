export interface RoutingSlipHistoryItem {
    stepNumber: number;
    fromUser: string;
    toUser: string;
    action: string;
    instructionCode?: string | null;
    comment?: string | null;
    dateStr: string;
    isUrgent: boolean;
}

export interface RoutingSlipConfigData {
    institutionName: string;
    subTitle: string;
    headerColor?: string;
    logoBuffer?: Buffer | null;
}

export interface RoutingSlipPdfParams {
    routingSlipCode: string;
    citeCode: string;
    dateStr: string;
    timeStr: string;
    procedencia: string;
    remitente: string;
    destinatario: string;
    referencia: string;
    proceso: string;
    adjunto: string;
    hojas: number;
    proveidos: RoutingSlipHistoryItem[];
    config?: RoutingSlipConfigData;
}

export interface IPdfGeneratorService {
    generateRoutingSlipPdf(params: RoutingSlipPdfParams): Promise<Buffer>;
}
