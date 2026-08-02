# Especificación: 008 - Visualizar Historial de un Documento

Describe QUÉ debe ocurrir y POR QUÉ, sin decidir todavía frameworks, tablas, librerías o estructura de archivos.

## CONTEXTO
- **Producto**: GestorDoc, un Sistema de Gestión de Correspondencia y Trámite Documentario.
- **Problema validado**: Los usuarios pueden derivar documentos, pero no tienen una forma de ver la trazabilidad completa de esos movimientos. Es difícil saber por dónde ha pasado un documento, quién lo envió y con qué instrucciones.
- **Usuario/rol principal**: `OPERADOR`, `ADMINISTRADOR`.
- **Feature**: Mostrar el historial de movimientos de un documento en su página de detalle.
- **Resultado de negocio**: Aumentar la transparencia y la auditabilidad del sistema, permitiendo a los usuarios rastrear el ciclo de vida completo de cualquier documento.

## HISTORIAS DE USUARIO

- Como `OPERADOR`, quiero ver el historial de un documento para entender su contexto, ver los comentarios anteriores y saber quién lo ha gestionado.
- Como `ADMINISTRADOR`, quiero poder auditar la ruta completa que ha seguido un documento para asegurar el cumplimiento de los procesos internos.

## ALCANCE

- **Dentro**:
  - En la página de detalle del documento (`/documents/[documentId]`), añadir una nueva sección o componente para el "Historial de Movimientos".
  - Esta sección mostrará una lista cronológica de todos los registros de la tabla `document_history` asociados al documento.
  - Cada entrada en el historial debe mostrar:
    - Fecha y hora del evento.
    - Área de Origen (si aplica).
    - Área de Destino.
    - Usuario que realizó la acción.
    - Comentario/Proveído.
  - La lista debe estar ordenada desde el evento más reciente al más antiguo.
  - Los datos del historial se obtendrán del lado del servidor junto con los detalles del documento.

- **Fuera por ahora**:
  - Filtrar o buscar dentro del historial.
  - Exportar el historial a PDF o CSV.
  - Una visualización gráfica tipo línea de tiempo (una lista simple es suficiente para el MVP).
  - Incluir eventos que no sean de derivación (ej. edición de metadatos).

## COMPORTAMIENTO OBSERVABLE

- **Precondiciones**: El usuario está en la página de detalle de un documento.
- **Flujo feliz**:
  1. El usuario navega a la página de un documento que ha sido derivado al menos una vez.
  2. Debajo de la tarjeta de "Información General", aparece una nueva sección "Historial de Movimientos".
  3. La sección muestra una lista de eventos. El más reciente está en la parte superior.
  4. Cada evento muestra claramente el área de origen, el área de destino, el usuario responsable, la fecha y el comentario asociado.
- **Flujos alternativos**:
  - **Documento sin historial**: Si un documento acaba de ser creado y nunca ha sido derivado, la sección de historial mostrará un mensaje como "Este documento aún no tiene historial de movimientos."

## CRITERIOS DE ACEPTACIÓN

- **Given** un usuario está en la página de detalle de un documento que ha sido derivado, **Then** el sistema debe mostrar una sección de historial con al menos un evento de "Derivación".
- **Given** un evento de historial se muestra en la lista, **Then** debe contener el nombre del área de origen, el nombre del área de destino, el nombre del usuario y el comentario.
- **Given** un usuario de la "Organización A" está viendo un documento, **Then** bajo ninguna circunstancia debe poder ver el historial de un documento de la "Organización B".

## REQUISITOS NO FUNCIONALES RELEVANTES

- **Seguridad**: La consulta para obtener el historial debe estar indirectamente protegida por el `organizationId`, ya que se basa en un `documentId` que ya ha sido validado para pertenecer a la organización del usuario.
- **Rendimiento**: La consulta del historial debe ser eficiente. Se deben usar `JOIN`s para obtener los nombres de las áreas y usuarios, y estos deben estar optimizados.

## DATOS A NIVEL CONCEPTUAL

- **Entidades**: `DocumentHistory`, `Document`, `AreaHierarchy`, `User`.
- **Operaciones**: `SELECT` en la tabla `document_history` con `JOIN`s a `area_hierarchy` (dos veces, para origen y destino) y a `users` para obtener los nombres correspondientes. La consulta se filtrará por `documentId`.

## SUPUESTOS, RIESGOS Y PREGUNTAS

- **Supuesto**: El nombre del usuario que realiza la acción se mostrará, no solo su ID. Esto requiere un `JOIN` con la tabla `users`.
- **Riesgo**: Si un documento tiene un historial muy extenso (cientos de movimientos), cargar la lista completa podría ralentizar la página de detalle. Para el MVP, se cargará todo, pero se podría considerar la paginación del historial en el futuro.