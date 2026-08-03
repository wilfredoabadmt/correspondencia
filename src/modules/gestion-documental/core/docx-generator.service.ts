export interface DocxTemplateParams {
    citeCode: string;
    dateStr: string;
    recipientName: string;
    recipientRole: string;
    senderName: string;
    senderRole: string;
    viaName?: string | null;
    viaRole?: string | null;
    subject: string;
    documentType: string;
}

export interface IDocxGeneratorService {
    generateTemplate(params: DocxTemplateParams): Promise<Buffer>;
}
