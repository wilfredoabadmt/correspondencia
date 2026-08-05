import { inject, injectable } from 'tsyringe';
import { InjectionTokens } from '~/core/injection-tokens';
import type { ICiteConfigRepository } from '../core/cite-config.repository';

export type GenerateNextCiteParams = {
    organizationId: string;
    areaId?: string | null;
    documentType?: string | null;
    areaCode?: string | null;
    orgCode?: string | null;
    year?: number;
};

@injectable()
export class GenerateNextCiteUseCase {
    constructor(
        @inject(InjectionTokens.CiteConfigRepository)
        private readonly citeConfigRepository: ICiteConfigRepository
    ) { }

    async execute({
        organizationId,
        areaId,
        documentType,
        areaCode,
        orgCode,
        year = new Date().getFullYear(),
    }: GenerateNextCiteParams): Promise<{ citeCode: string; sequenceNumber: number }> {
        let config = await this.citeConfigRepository.findByParams({
            organizationId,
            areaId,
            documentType,
            year,
        });

        // Default fallback rule if no rule was registered for the tenant
        if (!config) {
            config = await this.citeConfigRepository.upsert({
                organizationId,
                areaId: null,
                documentType: null,
                formatPattern: '{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO:4}/{AÑO}',
                currentSequence: 0,
                year,
                resetYearly: true,
            });
        }

        const nextSeq = await this.citeConfigRepository.incrementSequence(config.id);

        const formattedCite = this.formatPattern(config.formatPattern, {
            orgCode: orgCode || 'ENT',
            areaCode: areaCode || 'GRAL',
            documentType: documentType || 'DOC',
            seq: nextSeq,
            year,
        });

        return {
            citeCode: formattedCite,
            sequenceNumber: nextSeq,
        };
    }

    private formatPattern(
        pattern: string,
        data: { orgCode: string; areaCode: string; documentType: string; seq: number; year: number }
    ): string {
        let result = pattern;

        result = result.replace(/\{ENTIDAD\}|\{ORG\}/g, data.orgCode.toUpperCase());
        result = result.replace(/\{AREA\}|\{UNIDAD\}/g, data.areaCode.toUpperCase());
        result = result.replace(/\{TIPO\}/g, data.documentType.toUpperCase());
        result = result.replace(/\{AÑO\}|\{GESTION\}/g, String(data.year));

        // Format {NUMERO:X} or {NUMERO}
        result = result.replace(/\{NUMERO(?::(\d+))?\}/g, (_, padding) => {
            const padLen = padding ? parseInt(padding, 10) : 4;
            return String(data.seq).padStart(padLen, '0');
        });

        return result;
    }
}
