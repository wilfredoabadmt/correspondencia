# Especificación: 015 - Reportes Gerenciales, Monitoreo y Exportaciones (Excel / PDF)

Describe QUÉ debe ocurrir y POR QUÉ, sin decidir todavía frameworks, tablas, librerías o estructura de archivos.

## CONTEXTO
- **Producto**: GestorDoc, un Sistema de Gestión de Correspondencia y Trámite Documentario.
- **Problema validado**: Los directores, jefes de unidad y administradores necesitan monitorear el desempeño global de la correspondencia, generar reportes ejecutivos consolidados por rango de fechas, estados de avance y áreas administrativas, así como **exportar las planillas de correspondencia a Excel (`.xlsx`) y PDF**. Actualmente no existe un módulo dedicado de reportabilidad.
- **Usuario/rol principal**: Directores, Jefes de Unidad, Auditores y Administradores.
- **Feature**: Módulo de Reportes Gerenciales (`/reports`), filtros dinámicos y descargas binarias en Excel y PDF.
- **Resultado de negocio**: Capacidad de auditoría, toma de decisiones informada, monitoreo de cuellos de botella e informes de gestión oficial.

---

## HISTORIAS DE USUARIO

1. **Módulo de Consulta Gerencial y Filtros**:
   - Como `DIRECTOR / JEFE`, quiero acceder a la página de **Reportes Gerenciales** (`/reports`) para consultar el listado consolidado de trámites.
   - Quiero aplicar filtros por:
     - Rango de Fechas (Desde - Hasta).
     - Estado del documento (*Ingresado, Recibido, Pendiente, Archivados*).
     - Área de Destino / Procedencia.
     - Tipo de Documento (*Informe, Carta, Nota Interna, etc.*).

2. **Exportación a Planilla Excel (`.xlsx`)**:
   - Como `USUARIO GERENCIAL`, quiero hacer clic en **"Exportar a Excel (.xlsx)"** para descargar la planilla con todos los campos (CITE, Asunto, Remitente, Área Destino, Estado, Fecha Ingreso, Días Transcurridos y Observaciones) respetando los filtros seleccionados.

3. **Exportación a Reporte Oficial PDF**:
   - Como `AUDITOR / DIRECTOR`, quiero hacer clic en **"Exportar a PDF"** para obtener un reporte ejecutivo imprimible con membrete institucional, tabla resumida y totales de gestión.

---

## ALCANCE

### Dentro:
- Nueva vista `/reports` con filtros combinados y resumen cuantitativo.
- Endpoint de exportación Excel binario (`GET /api/reports/export/excel`).
- Endpoint de exportación PDF binario (`GET /api/reports/export/pdf`).
- Navegación sidebar actualizada con acceso a "Reportes Gerenciales".

### Fuera por ahora:
- Envío programado de reportes por correo electrónico de forma periódica.
