# Guía de Validación Rápida (Quickstart): Feature 013 - Plantillas Word e Impresión PDF

## 1. Escenario E2E: Descarga de Plantilla Word `.docx`

1. Navegar a la vista de detalle de cualquier documento (`/documents/[documentId]`).
2. Hacer clic en el botón **[Descargar Plantilla Word]**.
3. Abrir el archivo descargado en Microsoft Word o LibreOffice:
   - Verificar que el encabezado contenga el logo/membrete.
   - Verificar que los campos CITE, Destinatario, Remitente y Referencia estén correctamente completados con los datos del sistema.

---

## 2. Escenario E2E: Generación e Impresión de Hoja de Ruta PDF

1. Navegar a la vista de detalle de un documento o a las bandejas (`/inbox/pending`).
2. Hacer clic en **[Imprimir Hoja de Ruta]**.
3. Se abrirá/descargará el archivo PDF oficial:
   - Verificar el cuadro con el número de Hoja de Ruta `I-2026-xxxxx`.
   - Verificar la grilla de proveídos numerados (Proveído N° 1, N° 2, etc.) con la casilla marcada para la instrucción asignada.
   - Verificar el recuadro para "Sello Recibido" y "Hora".
