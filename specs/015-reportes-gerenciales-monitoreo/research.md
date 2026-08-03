# Investigaciones y Decisiones Técnicas: Feature 015 - Reportes Gerenciales, Monitoreo y Exportaciones

## 1. Exportación a Hojas de Cálculo Excel (`.xlsx`)

### Decisión
Utilizar la librería `exceljs` (Node.js) para la generación programática de archivos Excel (`.xlsx`) con estilos, bordes, cabeceras en negrita y anchos de columna auto-ajustables en el servidor.

- **Encabezados**: CITE, Asunto, Remitente, Área Destino, Estado, Fecha de Ingreso, Días Transcurridos, Semáforo de Morosidad.
- **Formato**: Hoja de cálculo estilizada profesionalmente con colores institucionales (encabezado azul oscuro, texto blanco, bordes finos).
- **Ventaja**: Generación síncrona/asíncrona en Buffer en memoria sin depender de herramientas externas.

---

## 2. Exportación a PDF Gerencial

### Decisión
Reutilizar el motor `pdfkit` (ya instalado e integrado en el proyecto) para compilar un reporte en formato horizontal (Landscape) o vertical (Portrait) con la lista consolidada de trámites, métricas totales y firma del auditor/director.

---

## 3. Filtros Avanzados y Arquitectura de Consultas

### Decisión
Crear el caso de uso `GenerateReportUseCase` e `IDocumentRepository.findForReport(params)` que acepte:
- `startDate?: Date`
- `endDate?: Date`
- `status?: string`
- `destinationAreaId?: string`
- `documentType?: string`

Retornando la lista de trámites junto con resúmenes estadísticos (total trámites, recibidos, pendientes, en mora).
