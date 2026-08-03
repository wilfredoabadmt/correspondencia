# Especificación: 012 - Flujo Completo de Bandejas de Correspondencia

Describe QUÉ debe ocurrir y POR QUÉ, sin decidir todavía frameworks, tablas, librerías o estructura de archivos.

## CONTEXTO
- **Producto**: GestorDoc, un Sistema de Gestión de Correspondencia y Trámite Documentario.
- **Problema validado**: En las instituciones públicas y empresas, la derivación de un documento requiere un flujo de custodia formal. Actualmente, al derivar un documento este pasa directamente a estado entregado. Falta el ciclo de confirmación en la **Bandeja Entrante** (**Recibir** para asumir responsabilidad o **Rechazar** con justificación si el soporte físico no coincide), la opción de **Cancelar Derivación** en la **Bandeja de Enviados** en caso de equivocación, la gestión activa en la **Bandeja de Pendientes** (**Justificar** demoras externas, **Agrupar** trámites y **Archivar**), y la custodia en la **Bandeja de Archivados** (**Desarchivar/Quitar de Archivo**).
- **Usuario/rol principal**: Servidores públicos, Jefes de Área y Operadores de Mesa de Partes.
- **Feature**: Implementar el ciclo completo de vida del trámite en bandejas (Entrante, Pendientes, Enviados y Archivados) con acciones explícitas de custodia, reversión, agrupación y archivado.
- **Resultado de negocio**: Garantizar trazabilidad legal, transparencia, cero pérdida de documentos y control estricto de la responsabilidad de cada funcionario en la custodia documental.

---

## HISTORIAS DE USUARIO

1. **Recepción Formal de Custodia (Bandeja Entrante)**:
   - Como `DESTINATARIO`, quiero ver en mi **Bandeja Entrante** la correspondencia que me ha sido derivada pero que aún no he recepcionado.
   - Como `DESTINATARIO`, quiero hacer clic en **"Recibir"** para confirmar la recepción física/digital del documento, pasando el estado del trámite a **"Pendiente"** bajo mi responsabilidad.
   - Como `DESTINATARIO`, quiero hacer clic en **"Rechazar"** e ingresar un motivo obligatorio cuando la correspondencia no me corresponda o no haya llegado físicamente, haciendo que el trámite retorne inmediatamente a la bandeja de pendientes del remitente.

2. **Reversión de Envíos Erróneos (Bandeja de Enviados)**:
   - Como `REMITENTE`, quiero ver en mi **Bandeja de Enviados** los trámites que he derivado a otros usuarios y conocer si ya fueron recepcionados o siguen pendientes de recepción.
   - Como `REMITENTE`, quiero poder hacer clic en **"Cancelar Derivación"** en trámites que aún **NO** hayan sido recepcionados por el destinatario, para corregir un envío equivocado y devolver el documento a mi bandeja de pendientes.

3. **Gestión Activa de Pendientes (Bandeja de Pendientes)**:
   - Como `USUARIO EN CUSTODIA`, quiero ver en mi **Bandeja de Pendientes** todos los documentos que he recepcionado y que están bajo mi responsabilidad.
   - Como `USUARIO EN CUSTODIA`, quiero poder registrar un **"Justificativo"** cuando la atención de un trámite esté paralizada por causas externas (ej. esperando respuesta de un proveedor o inspección de campo), para que dicha justificación quede visible en la Hoja de Ruta y el seguimiento.
   - Como `USUARIO EN CUSTODIA`, quiero **"Agrupar"** dos o más Hojas de Ruta seleccionando una Hoja de Ruta principal, para unificar trámites relacionados en un solo expediente.
   - Como `USUARIO EN CUSTODIA`, quiero **"Archivar"** un trámite concluido asignándole una carpeta de archivo (ej. `GESTION-2026` o `CONTRATOS`) y una observación, retirándolo de mi lista de pendientes activa.

4. **Custodia y Reapertura (Bandeja de Archivados)**:
   - Como `USUARIO`, quiero consultar la **Bandeja de Archivados** organizada por carpetas para revisar trámites concluidos de mi área u organización.
   - Como `USUARIO AUTORIZADO`, quiero hacer clic en **"Quitar de Archivo" (Desarchivar)** en un documento archivado para devolverlo a mi bandeja de pendientes si se requiere continuar con el trámite.

---

## ALCANCE

### Dentro:
- **Rediseño y estructuración de 4 Bandejas Principales**:
  - `Bandeja Entrante`: Trámites remitidos pero sin confirmar recepción. Acciones: `[Recibir]`, `[Rechazar]`.
  - `Bandeja Pendientes`: Trámites recepcionados activos. Acciones: `[Derivar (Oficial / Copia)]`, `[Responder con...]`, `[Justificar]`, `[Agrupar]`, `[Archivar]`.
  - `Bandeja Enviados`: Trámites derivados salientes. Acciones: `[Cancelar Derivación]` (solo si recepción = pendiente).
  - `Bandeja Archivados`: Trámites cerrados por carpetas. Acciones: `[Quitar de Archivo / Desarchivar]`.
- **Transacciones de Estado Atómicas**:
  - `Pendiente de Recepción` $\rightarrow$ `Recibido/Pendiente` (al presionar Recibir).
  - `Pendiente de Recepción` $\rightarrow$ `Rechazado` (al presionar Rechazar con motivo obligante).
  - `Pendiente de Recepción` $\rightarrow$ `Pendiente (Remitente)` (al presionar Cancelar Derivación).
  - `Pendiente` $\rightarrow$ `Archivado` (al Archivar en Carpeta).
  - `Archivado` $\rightarrow$ `Pendiente` (al Desarchivar).
- **Control de Aislamiento Multi-tenant**:
  - Todas las bandejas muestran únicamente trámites pertenecientes a la organización y área/usuario autenticado.

### Fuera por ahora:
- Firma digital de certificados PKI/token (se maneja firma ológrafa / PDF cargado).
- Notificaciones por correo SMS o Push WhatsApp (se consideran para subsiguientes specs).

---

## CRITERIOS DE ACEPTACIÓN DE NEGOCIO

1. **Recepción / Rechazo**:
   - Todo documento derivado aparece en la *Bandeja Entrante* del destinatario en estado `PENDIENTE_RECEPCION`.
   - Si el destinatario presiona **Recibir**, el estado cambia a `RECIBIDO`, se registra la fecha/hora exacta y el documento se traslada a la *Bandeja de Pendientes*.
   - Si el destinatario presiona **Rechazar**, es obligatorio ingresar un comentario de justificación. El documento vuelve a la *Bandeja de Pendientes* del remitente con bandera de rechazo.

2. **Cancelación de Derivación**:
   - Si el documento está en `PENDIENTE_RECEPCION`, el remitente ve habilitado el botón **Cancelar Derivación** en su *Bandeja de Enviados*.
   - Al presionar **Cancelar Derivación**, la derivación se invalida y el documento regresa automáticamente a los *Pendientes* del remitente.
   - Si el destinatario ya presiono **Recibir**, el botón **Cancelar Derivación** se deshabilita automáticamente.

3. **Agrupación y Archivación**:
   - Al agrupar trámites, se debe seleccionar explícitamente cuál es el trámite principal. Los trámites secundarios heredan el historial de derivación del principal.
   - Al archivar, se requiere seleccionar o crear una carpeta temática y añadir observaciones.
