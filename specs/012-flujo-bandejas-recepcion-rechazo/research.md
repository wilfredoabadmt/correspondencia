# Investigaciones y Decisiones Técnicas: Feature 012 - Flujo Completo de Bandejas

## 1. Gestión de Estados y Transiciones del Trámite

### Decisión
Adoptar una Máquina de Estados explícita en el dominio para el ciclo de vida del trámite:

- `PENDIENTE_RECEPCION`: El documento fue derivado a un usuario/área, pero el destinatario no ha confirmado la recepción física/digital.
- `RECIBIDO`: El destinatario presionó "Recibir". El documento está bajo su responsabilidad en la **Bandeja de Pendientes**.
- `RECHAZADO`: El destinatario rechazó el documento por error de asignación o falta de soporte físico. Retorna a la bandeja del remitente con motivo.
- `CANCELADO`: El remitente canceló la derivación antes de que el destinatario la recepcionara. Retorna a los pendientes del remitente.
- `ARCHIVADO`: El trámite fue cerrado y movido a un archivero digital/carpeta temática.

### Razón Técnica
Asegura atomicidad con transacciones en Drizzle ORM (`db.transaction(...)`). Evita condiciones de carrera (ej. intentar recibir un documento que el remitente está cancelando simultáneamente).

---

## 2. Estrategia de Agrupación de Trámites

### Decisión
Agregar un campo auto-referencial `groupedIntoDocumentId` en la tabla `documents`.
- **Hoja de Ruta Principal**: Es el documento contenedor (`groupedIntoDocumentId = null`).
- **Hojas de Ruta Secundarias**: Referencian al ID del documento principal (`groupedIntoDocumentId = mainDoc.id`).

### Razón Técnica
Mantiene la simplicidad del esquema sin necesidad de crear tablas adicionales N:M complejas, permitiendo búsquedas rápidas en Drizzle y filtrado en las consultas de bandejas.

---

## 3. Estrategia de Archivación y Carpetas

### Decisión
Utilizar una estructura de carpetas por organización en la tabla `document_folders` o campo `folderCategory` + `folderObservations` en el historial del documento.

- `folderCategory`: Nombre de la carpeta de destino (ej: "GESTION-2026", "INSPECCIONES_OBRAS").
- `archiveObservations`: Comentarios o notas al momento del archivado.

### Razón Técnica
Permite organizar y consultar la correspondencia archivada por áreas o por año de gestión manteniendo la compatibilidad multi-tenant.
