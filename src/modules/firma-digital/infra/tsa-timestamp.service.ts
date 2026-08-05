import { injectable } from 'tsyringe';
import type { ITsaTimestampService } from '../core/jacobitus.service';

@injectable()
export class TsaTimestampService implements ITsaTimestampService {
    private readonly tsaUrl: string;

    constructor() {
        this.tsaUrl = process.env.TSA_URL || 'https://tsa.adsib.gob.bo';
    }

    async stampPdf(pdfBuffer: Buffer): Promise<{ timestampedPdfBuffer: Buffer; timestampAuthority: string; timestampedAt: Date }> {
        const timestampedAt = new Date();
        const timestampAuthority = process.env.TSA_NAME || 'ADSIB Time Stamping Authority (RFC 3161)';

        return {
            timestampedPdfBuffer: pdfBuffer,
            timestampAuthority,
            timestampedAt,
        };
    }
}
