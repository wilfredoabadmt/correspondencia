# Especificación Funcional: Feature 021 - Proveídos Tipificados y Derivación Multidestino (Original / Copia)

## 1. Contexto y Objetivos

La funcionalidad de **Proveídos Tipificados y Derivación Multidestino** (adaptada de LONDRA AGETIC) amplía la capacidad de distribución de correspondencia en instituciones públicas.

Permite:
1. **Proveídos Estandarizados**: Seleccionar instrucciones predefinidas institucionales (ej: *"Para su atención y fines pertinentes"*, *"Análisis e Informe"*, *"Para conocimiento y archivo"*, *"Dar curso a lo solicitado"*).
2. **Derivación Multidestino (Original vs. Copia)**: Enviar un documento simultáneamente a un área destinataria titular (**Original**) y a múltiples áreas secundarias (**Copia Informativa**).

---

## 2. Historias de Usuario

### Historia 1: Selección de Proveídos Tipificados
> **Como** Servidor Público / Jefe de Área,  
> **Quiero** elegir una o más instrucciones tipificadas al derivar un documento,  
> **Para** agilizar el registro sin escribir textos repetitivos.

### Historia 2: Derivación Multidestino (Original / Copia)
> **Como** Servidor Público,  
> **Quiero** derivar el documento a un destino principal (Original) y marcar copias informativas a otras áreas,  
> **Para** notificar a múltiples dependencias sin fragmentar el trámite original.

### Historia 3: Consulta de Bandeja de Copias e Historial Multidestino
> **Como** Servidor Público,  
> **Quiero** distinguir en mis bandejas los documentos recibidos como "Original" de los recibidos como "Copia",  
> **Para** priorizar las tareas ejecutivas sobre las lecturas informativas.

---

## 3. Criterios de Aceptación (Behavioral Requirements)

### Escenario 1: Formulario de Derivación Multidestino
- **Dado** un usuario derivando un documento desde `/documents/[id]`,
- **Cuando** selecciona un área como **Original** (ej: *Dirección de Tecnologías*) y 2 áreas como **Copia** (ej: *Unidad Financiera*, *Auditoría Interna*),
- **Entonces** el sistema registra la derivación creando una entrada en el historial con tipo `OFICIAL` para el Original y entradas tipo `COPIAS` para las áreas copiadas.

### Escenario 2: Asignación de Proveído Tipificado
- **Dado** el formulario de derivación,
- **Cuando** el usuario marca la casilla *"Análisis e Informe"* y agrega un comentario opcional,
- **Entonces** el proveído tipificado queda registrado formalmente en la Hoja de Ruta PDF y en el historial del documento.

### Escenario 3: Filtro en Bandejas y Hoja de Ruta
- **Dado** una autoridad en la bandeja de entrada,
- **Cuando** consulta su lista de trámites,
- **Entonces** puede filtrar y visualizar badges distintivos entre trámites "Original" (requieren acción) y trámites "Copia" (solo conocimiento).
