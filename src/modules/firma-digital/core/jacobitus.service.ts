export type JacobitusSlot = {
    slot: number;
    description: string;
    tokenName: string;
};

export type JacobitusCertificate = {
    alias: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
};

export type SignPdfParams = {
    pdfBase64: string;
    slot: number;
    pin: string;
    alias: string;
};

export type SignPdfResult = {
    signedPdfBase64: string;
    signatureHash: string;
    subject: string;
    issuer: string;
};

export interface IJacobitusService {
    getSlots(): Promise<JacobitusSlot[]>;
    getCertificates(slot: number, pin: string): Promise<JacobitusCertificate[]>;
    signPdf(params: SignPdfParams): Promise<SignPdfResult>;
}

export interface ITsaTimestampService {
    stampPdf(pdfBuffer: Buffer): Promise<{ timestampedPdfBuffer: Buffer; timestampAuthority: string; timestampedAt: Date }>;
}
