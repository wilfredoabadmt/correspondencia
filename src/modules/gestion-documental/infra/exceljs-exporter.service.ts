import { injectable } from 'tsyringe';
import ExcelJS from 'exceljs';
import type { IExcelExporterService, ReportExportData } from '../core/excel-exporter.service';

@injectable()
export class ExceljsExporterService implements IExcelExporterService {
    async generateReportSpreadsheet(data: ReportExportData): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'GestorDoc';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Reporte de Correspondencia');

        // Título del Reporte
        sheet.mergeCells('A1:H1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'REPORTE GERENCIAL DE CORRESPONDENCIA Y TRÁMITES';
        titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        sheet.getRow(1).height = 30;

        // Subtítulo
        sheet.mergeCells('A2:H2');
        const subTitleCell = sheet.getCell('A2');
        subTitleCell.value = `Entidad: ${data.organizationName} | Generado: ${new Date().toLocaleDateString('es-PE')}`;
        subTitleCell.font = { name: 'Arial', size: 10, italic: true };
        subTitleCell.alignment = { horizontal: 'center' };

        sheet.getRow(3).height = 10;

        // Cabecera de Tabla
        const headers = [
            'N° Hoja de Ruta',
            'Asunto',
            'Remitente',
            'Área Destino',
            'Estado',
            'Tipo',
            'Fecha Recepción',
            'Días (Plazo)',
        ];

        const headerRow = sheet.getRow(4);
        headers.forEach((h, idx) => {
            const cell = headerRow.getCell(idx + 1);
            cell.value = h;
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        headerRow.height = 24;

        // Filas de Datos
        data.documents.forEach((doc, idx) => {
            const row = sheet.getRow(idx + 5);
            row.values = [
                doc.trackingCode,
                doc.subject,
                doc.sender,
                doc.destinationAreaName,
                doc.status,
                doc.documentType,
                doc.receptionDateStr,
                doc.daysElapsed,
            ];

            const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
            for (let i = 1; i <= 8; i++) {
                const cell = row.getCell(i);
                cell.font = { name: 'Arial', size: 9 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                };
            }
        });

        sheet.columns = [
            { width: 22 },
            { width: 35 },
            { width: 25 },
            { width: 25 },
            { width: 16 },
            { width: 16 },
            { width: 18 },
            { width: 14 },
        ];

        const uint8 = await workbook.xlsx.writeBuffer();
        return Buffer.from(uint8);
    }
}
