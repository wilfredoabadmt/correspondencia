# Feature 017: Gestión de Expedientes Virtuales

## 1. Resumen

Esta funcionalidad introduce el concepto de "Expediente Virtual", un contenedor que permite a los usuarios agrupar y gestionar múltiples documentos y trámites relacionados como una única unidad. Esto transforma al sistema de un simple gestor de correspondencia a un gestor de casos, facilitando el seguimiento de asuntos complejos que involucran varias piezas de comunicación.

## 2. User Story

**Como** usuario del sistema (ej. analista, jefe de área),
**Quiero** poder agrupar múltiples trámites y documentos (internos o externos) en un "Expediente Virtual",
**Para** tener una vista consolidada y facilitar el seguimiento y la búsqueda de todos los documentos relacionados con un mismo caso o proyecto.

## 3. Criterios de Aceptación (Qué se debe cumplir)

### 3.1. Creación y Gestión de Expedientes
- [ ] Debe existir una nueva sección en la interfaz de usuario para listar y gestionar "Expedientes".
- [ ] Los usuarios con permisos adecuados podrán crear un nuevo "Expediente", asignándole:
    - Un código único autogenerado (ej. `EXP-2026-0001`).
    - Un nombre o asunto descriptivo.
    - Un estado inicial (ej. "Abierto").
- [ ] Se podrá modificar el nombre y el estado ("Abierto", "Cerrado", "Archivado") de un expediente existente.

### 3.2. Asociación de Documentos
- [ ] Desde la vista de un documento (bandejas, historial, etc.), debe existir la opción "Asociar a Expediente".
- [ ] Al seleccionar esta opción, el usuario podrá buscar un expediente existente por nombre o código y vincular el documento.
- [ ] Un documento solo podrá pertenecer a un expediente a la vez para mantener la simplicidad del flujo. Si se intenta asociar un documento ya vinculado, el sistema debe informar al usuario.
- [ ] Desde la vista del expediente, se podrá desvincular un documento.

### 3.3. Visualización y Navegación
- [ ] Se creará una pantalla de "Detalle de Expediente".
- [ ] Esta pantalla mostrará la información principal del expediente (código, nombre, estado).
- [ ] La pantalla listará todos los documentos asociados al expediente, mostrando para cada uno información clave (ej. código, referencia, remitente/destinatario actual, fecha, estado del trámite).
- [ ] Cada documento en la lista debe ser un enlace que lleve al detalle de dicho documento.

### 3.4. Búsqueda
- [ ] El sistema de búsqueda global debe ser capaz de encontrar expedientes por su código o por palabras clave en su nombre/asunto.
