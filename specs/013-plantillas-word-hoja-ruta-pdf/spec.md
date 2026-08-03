# Especificación: 013 - Generación de Plantillas Word (.docx) e Impresión de Hoja de Ruta Oficial PDF

Describe QUÉ debe ocurrir y POR QUÉ, sin decidir todavía frameworks, tablas, librerías o estructura de archivos.

## CONTEXTO
- **Producto**: GestorDoc, un Sistema de Gestión de Correspondencia y Trámite Documentario.
- **Problema validado**: En la gestión gubernamental e institucional, los servidores públicos necesitan elaborar documentos oficiales (Informes, Notas Internas, Cartas) siguiendo formatos estandarizados y membretes institucionales. Actualmente, el usuario tiene que escribir los metadatos manualmente en Word. Se requiere que el sistema genere automáticamente una **Plantilla Word (`.docx`)** pre-llenada con el CITE, Remitente, Destinatario, Vía y Referencia. Además, se requiere la generación e impresión de la **Hoja de Ruta Oficial en PDF** (carátula con grilla de proveídos y cuadros para sellos y firmas de recepción).
- **Usuario/rol principal**: Funcionarios de todas las áreas (Operadores, Jefes de Unidad, Directores y Mesa de Partes).
- **Feature**: Descarga de plantillas Word pre-llenadas y generación automatizada de PDF de la Hoja de Ruta Oficial.
- **Resultado de negocio**: Estandarización institucional, eliminación de errores de transcripción manual en encabezados y cumplimiento del formato oficial de trámite documental.

---

## HISTORIAS DE USUARIO

1. **Descarga de Plantilla Word (`.docx`) Pre-llenada**:
   - Como `USUARIO REDACTOR`, quiero hacer clic en **"Descargar Plantilla (.docx)"** en el detalle de un documento creado o en la pantalla de elaboración.
   - Quiero que el archivo Word descargado contenga el logo institucional, el código CITE oficial, la fecha, los campos de *A:* (Destinatario), *DE:* (Remitente), *VÍA:* (Inmediato Superior si aplica) y *REF:* (Referencia) pre-completados con la información del sistema.

2. **Generación e Impresión de Hoja de Ruta Oficial PDF**:
   - Como `USUARIO DE MESA DE PARTES / FUNCIONARIO`, quiero hacer clic en **"Imprimir Hoja de Ruta"** desde el detalle del documento o desde las bandejas.
   - Quiero obtener un archivo PDF con formato oficial estandarizado que contenga:
     - Membrete y cabecera de la entidad.
     - Recuadro destacado con el número de Hoja de Ruta (ej. `I-2026-00546` o `E-2026-00123`).
     - Cuadro de metadatos (Procedencia, Remitente, Destinatario, Referencia, Proceso, Fecha y Hora).
     - Grilla numerada de proveídos (Proveído N° 1, N° 2, N° 3) con casillas marcables (*Atención urgente, Elaborar informe, Para su consideración, Para su conocimiento, Para V°B°, Archivar, Otro*) y recuadro reservado para el **Sello y Firma de Recepción Física**.

3. **Impresión de Seguimiento Histórico PDF**:
   - Como `SUPERVISOR / DIRECTOR`, quiero imprimir el PDF del historial de seguimiento completo de una hoja de ruta con todas las derivaciones y tiempos transcurridos.

---

## ALCANCE

### Dentro:
- Generación dinámica de plantillas `.docx` con etiquetas/placeholders dinámicos (`docx-templates` o `docxtemplater`).
- Generación de PDF con diseño exacto de la Hoja de Ruta institucional en React-PDF (`@react-pdf/renderer`) o Puppeteer/HTML-to-PDF.
- Endpoint o Server Action de descarga de archivo binario PDF y `.docx`.
- Botón **[Imprimir Hoja de Ruta]** y **[Descargar Plantilla]** en las vistas de detalle y bandejas.

### Fuera por ahora:
- Edición WYSIWYG en línea dentro del navegador (el usuario descarga el `.docx`, edita en Word y sube el PDF firmado).

---

## CRITERIOS DE ACEPTACIÓN DE NEGOCIO

1. **Plantilla Word**:
   - El archivo descargado debe ser un archivo válido `.docx` editable en Microsoft Word / LibreOffice.
   - Todos los placeholders (`{CITE}`, `{DESTINATARIO}`, `{REMITENTE}`, `{FECHA}`, `{REFERENCIA}`) deben ser reemplazados con los datos reales del documento.

2. **Hoja de Ruta PDF**:
   - El PDF generado debe ser vectorizado, imprimible en tamaño Carta / A4.
   - Debe incluir la cuadrícula de proveídos con espacio suficiente para sello manual y firma.
