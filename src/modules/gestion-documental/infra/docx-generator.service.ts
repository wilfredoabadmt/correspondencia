import { injectable } from 'tsyringe';
import {
    Document as DocxDocument,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    HeadingLevel,
    AlignmentType,
} from 'docx';
import type { IDocxGeneratorService, DocxTemplateParams } from '../core/docx-generator.service';

@injectable()
export class DocxGeneratorService implements IDocxGeneratorService {
    async generateTemplate(params: DocxTemplateParams): Promise<Buffer> {
        const rows: TableRow[] = [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ children: [new TextRun({ text: 'A:', bold: true })] })],
                    }),
                    new TableCell({
                        width: { size: 80, type: WidthType.PERCENTAGE },
                        children: [new Paragraph(`${params.recipientName}\n${params.recipientRole}`)],
                    }),
                ],
            }),
        ];

        if (params.viaName) {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 20, type: WidthType.PERCENTAGE },
                            children: [new Paragraph({ children: [new TextRun({ text: 'VÍA:', bold: true })] })],
                        }),
                        new TableCell({
                            width: { size: 80, type: WidthType.PERCENTAGE },
                            children: [new Paragraph(`${params.viaName}\n${params.viaRole ?? ''}`)],
                        }),
                    ],
                })
            );
        }

        rows.push(
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ children: [new TextRun({ text: 'DE:', bold: true })] })],
                    }),
                    new TableCell({
                        width: { size: 80, type: WidthType.PERCENTAGE },
                        children: [new Paragraph(`${params.senderName}\n${params.senderRole}`)],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ children: [new TextRun({ text: 'REF:', bold: true })] })],
                    }),
                    new TableCell({
                        width: { size: 80, type: WidthType.PERCENTAGE },
                        children: [new Paragraph(params.subject)],
                    }),
                ],
            })
        );

        const doc = new DocxDocument({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: 'DOCUMENTO OFICIAL INSTITUCIONAL',
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            text: `CITE: ${params.citeCode}`,
                            alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({
                            text: `FECHA: ${params.dateStr}`,
                            alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({ text: '' }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows,
                        }),
                        new Paragraph({ text: '' }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `[Desarrollo del ${params.documentType} aquí...]`,
                                    italics: true,
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
    }
}
