# Investigaciones y Decisiones Técnicas: Feature 013 - Plantillas Word (.docx) e Impresión PDF

## 1. Generación de Plantillas Word (`.docx`)

### Decisión
Utilizar la librería `docx` (Node.js) para la generación programática fluida de documentos Word con encabezados, tablas y formato institucional en el servidor (Server Actions / Route Handlers).

- **Estructura**: Documento con membrete institucional, tablas formateadas con bordes para `CITE`, `A:`, `DE:`, `VÍA:`, `FECHA:`, `REFERENCIA:`.
- **Ventaja**: Cero dependencias externas de Microsoft Word u Office en el servidor; generación pura en buffer en Node.js en milisegundos.

---

## 2. Generación e Impresión de Hoja de Ruta Oficial PDF

### Decisión
Utilizar `@react-pdf/renderer` para renderizar el documento PDF de la Hoja de Ruta Oficial directamente en el servidor Next.js como un Stream o Buffer descargable.

- **Diseño del PDF**:
  - Encabezado con logo institucional y título "HOJA DE RUTA INTERNA / EXTERNA".
  - Recuadro CITE ORIGINAL y fecha/hora.
  - Tabla de Metadatos (Procedencia, Remitente, Destinatario, Referencia, Proceso, Adjuntos, Hojas).
  - Bloques de Proveído N° 1, N° 2, N° 3 con casillas de verificación (*Atención Urgente, Elaborar Informe, Elaborar Respuesta, Para su Consideración, Para su Conocimiento, Para V°B°, Archivar, Otro*) y área de **Sello Recibido** y **Hora**.

---

## 3. Compatibilidad Multi-tenant y Almacenamiento

### Decisión
Las plantillas y PDF se generan al vuelo (*on-the-fly*) mediante endpoints dinámicos de Next.js (`/api/documents/[id]/routing-slip.pdf` y `/api/documents/[id]/template.docx`).
Se verifica la propiedad de la organización (`organizationId`) antes de enviar el Buffer binario con encabezados `Content-Type: application/pdf` o `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
