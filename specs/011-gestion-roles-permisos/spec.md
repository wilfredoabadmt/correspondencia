# Especificación: 011 - Gestión de Roles y Permisos Granulares

Describe QUÉ debe ocurrir y POR QUÉ, sin decidir todavía frameworks, tablas, librerías o estructura de archivos.

## CONTEXTO
- **Producto**: GestorDoc, un Sistema de Gestión de Correspondencia y Trámite Documentario.
- **Problema validado**: El sistema actual solo cuenta con dos roles fijos (`OPERADOR`, `ADMINISTRADOR`), lo cual limita la flexibilidad de las organizaciones para definir accesos más específicos según sus procesos internos. Los administradores necesitan una forma de adaptar los permisos a las responsabilidades reales de sus usuarios.
- **Usuario/rol principal**: `ADMINISTRADOR` (de la organización).
- **Feature**: Permitir a los administradores de cada organización definir roles personalizados y asignar permisos granulares a estos roles.
- **Resultado de negocio**: Aumentar la flexibilidad y seguridad del sistema, permitiendo a las organizaciones modelar con precisión el control de acceso de sus usuarios, alineándolo con sus estructuras y procesos internos.

## HISTORIAS DE USUARIO

- Como `ADMINISTRADOR` de mi organización, quiero crear roles personalizados (ej. "Revisor de Contratos", "Mesa de Partes", "Gerente de Área"), para agrupar permisos de forma lógica y asignarlos a usuarios.
- Como `ADMINISTRADOR` de mi organización, quiero asignar permisos específicos (ej. "crear documento", "ver todos los documentos", "editar documentos propios", "derivar documento", "gestionar usuarios", "gestionar áreas") a cada rol personalizado, para controlar qué acciones pueden realizar los usuarios con ese rol.
- Como `ADMINISTRADOR` de mi organización, quiero ver una lista de todos los roles de mi organización y los permisos asignados a cada uno, para tener una visión clara de los niveles de acceso.
- Como `ADMINISTRADOR` de mi organización, quiero editar roles existentes (cambiar nombre, añadir/quitar permisos), para adaptar los accesos a las necesidades cambiantes de mi organización.
- Como `ADMINISTRADOR` de mi organización, quiero eliminar roles personalizados, para retirar configuraciones de acceso obsoletas.
- Como `ADMINISTRADOR` de mi organización, quiero asignar estos roles personalizados a los usuarios (a través de la gestión de usuarios), para que tengan los niveles de acceso apropiados.
- Como `ADMINISTRADOR` de mi organización, no quiero poder gestionar roles o permisos de otras organizaciones, para mantener la seguridad y el aislamiento multi-tenant.
- Como `USUARIO` (con cualquier rol), quiero que mi acceso a las funcionalidades del sistema esté determinado por los permisos asignados a mi rol, para poder realizar mis tareas de forma segura y eficiente.

## ALCANCE

- **Dentro**:
  - Una nueva página/sección accesible solo para usuarios con rol `ADMINISTRADOR` de su organización, dedicada a la "Gestión de Roles y Permisos".
  - La página mostrará una tabla con los roles definidos para **su propia organización**, incluyendo el nombre del rol y un resumen de sus permisos.
  - Funcionalidad para **crear** un nuevo rol personalizado:
    - El `ADMINISTRADOR` ingresa un nombre único para el rol.
    - El `ADMINISTRADOR` selecciona permisos de una lista predefinida de permisos disponibles (ej. `document.create`, `document.view.all`, `document.edit.own`, `document.derive`, `user.manage`, `area.manage`, `role.manage`).
  - Funcionalidad para **editar** un rol existente:
    - El `ADMINISTRADOR` podrá cambiar el nombre del rol (solo para roles personalizados) y añadir/quitar permisos.
    - Los roles por defecto del sistema (`OPERADOR`, `ADMINISTRADOR`) no podrán ser renombrados, pero sus permisos sí podrán ser modificados.
    - Un `ADMINISTRADOR` no podrá quitarse a sí mismo permisos críticos que le impidan administrar el sistema (ej. `role.manage`, `user.manage`).
  - Funcionalidad para **eliminar** un rol:
    - El `ADMINISTRADOR` podrá eliminar un rol personalizado.
    - Un rol no podrá ser eliminado si está actualmente asignado a algún usuario.
    - Los roles por defecto del sistema (`OPERADOR`, `ADMINISTRADOR`) no podrán ser eliminados.
  - Todas las operaciones de gestión de roles y permisos deben estar estrictamente vinculadas a la `organizationId` del `ADMINISTRADOR` que realiza la acción.
  - La página de "Gestión de Usuarios" (Feature 010) se actualizará para permitir la asignación de estos roles personalizados a los usuarios.
  - La lógica de autorización del sistema se adaptará para verificar permisos específicos en lugar de solo roles fijos.

- **Fuera por ahora**:
  - Flujos de recuperación de contraseña o restablecimiento por parte del usuario (será una feature de autenticación).
  - Envío automático de emails de invitación o notificación de contraseña temporal.
  - Gestión de permisos granulares más allá de los roles `OPERADOR` y `ADMINISTRADOR`.
  - Desactivación/activación de usuarios en lugar de eliminación.
  - Importación/exportación masiva de usuarios.
  - Auditoría de cambios en usuarios.
  - Un `ADMINISTRADOR` no podrá cambiar su propio rol ni eliminarse a sí mismo.

## COMPORTAMIENTO OBSERVABLE

- **Precondiciones**: Un usuario con rol `ADMINISTRADOR` ha iniciado sesión.
- **Flujo feliz (Ver usuarios)**:
  1. El `ADMINISTRADOR` navega a la sección "Gestión de Usuarios".
  2. Se muestra una tabla con todos los usuarios de su organización, incluyendo Nombre, Email y Rol.
- **Flujo feliz (Crear usuario)**:
  1. El `ADMINISTRADOR` hace clic en "Invitar nuevo usuario".
  2. Rellena el formulario con Nombre, Email y selecciona un Rol.
  3. El sistema crea el usuario y muestra una contraseña temporal (o un mensaje indicando que se ha enviado una invitación).
  4. El nuevo usuario puede iniciar sesión con su email y la contraseña temporal.
- **Flujo feliz (Editar usuario)**:
  1. El `ADMINISTRADOR` selecciona un usuario de la tabla y hace clic en "Editar".
  2. Modifica el Nombre y/o el Rol del usuario.
  3. Los cambios se guardan y se reflejan en la tabla.
- **Flujo feliz (Eliminar usuario)**:
  1. El `ADMINISTRADOR` selecciona un usuario de la tabla y hace clic en "Eliminar".
  2. Confirma la eliminación.
  3. El usuario es eliminado de la organización y ya no puede iniciar sesión.
- **Flujo alternativo (Acceso no autorizado)**:
  - Si un usuario con rol `OPERADOR` intenta acceder a la sección "Gestión de Usuarios", se le deniega el acceso (ej. redirigiendo a su dashboard o mostrando un mensaje de error).
- **Flujo alternativo (Gestión multi-tenant)**:
  - Un `ADMINISTRADOR` no puede ver, editar o eliminar usuarios que no pertenecen a su `organizationId`.
- **Flujo alternativo (Eliminar último ADMIN)**:
  - Si un `ADMINISTRADOR` intenta eliminarse a sí mismo o al último `ADMINISTRADOR` de la organización, el sistema deniega la acción con un mensaje de error.

## CRITERIOS DE ACEPTACIÓN

- **Given** un usuario con rol `ADMINISTRADOR` de la `OrgA`, **When** accede a la sección de gestión de usuarios, **Then** solo ve los usuarios de la `OrgA`.
- **Given** un usuario con rol `OPERADOR`, **When** intenta acceder a la sección de gestión de usuarios, **Then** se le deniega el acceso.
- **Given** un `ADMINISTRADOR` de la `OrgA` intenta crear un usuario con un email ya registrado en la `OrgB`, **Then** el sistema permite la creación, asociando el usuario a la `OrgA` (los emails pueden ser únicos por organización, no globalmente).
- **Given** un `ADMINISTRADOR` de la `OrgA` crea un nuevo usuario, **When** el usuario intenta iniciar sesión por primera vez con la contraseña temporal, **Then** se le permite el acceso y se le pide cambiar la contraseña.
- **Given** un `ADMINISTRADOR` de la `OrgA` intenta eliminar al único `ADMINISTRADOR` restante de la `OrgA`, **Then** el sistema deniega la acción con un mensaje de error.
- **Given** un `ADMINISTRADOR` de la `OrgA` intenta cambiar el rol de un usuario de `OrgB`, **Then** el sistema deniega la acción.

## REQUISITOS NO FUNCIONALES RELEVANTES

- **Seguridad**: Todas las operaciones de gestión de usuarios deben aplicar estrictamente el aislamiento multi-tenant y la autorización por roles en el servidor. Las contraseñas temporales deben ser generadas de forma segura y cifradas en la base de datos.
- **Usabilidad**: La interfaz de gestión de usuarios debe ser intuitiva y fácil de usar para los `ADMINISTRADOR`es.
- **Rendimiento**: La carga de la lista de usuarios debe ser eficiente, especialmente si una organización tiene muchos usuarios.

## DATOS A NIVEL CONCEPTUAL

- **Entidades**: `User`, `Organization`.
- **Operaciones**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` en la tabla `users`, siempre filtrando por `organizationId`.

## SUPUESTOS, RIESGOS Y PREGUNTAS

- **Supuesto**: La tabla `users` ya contiene los campos `organizationId` y `role`.
- **Riesgo**: La gestión de contraseñas temporales y el primer inicio de sesión requieren un flujo de autenticación robusto que debe ser diseñado cuidadosamente.
- **Pregunta**: ¿Cómo se comunicará la contraseña temporal al nuevo usuario? (Por ahora, se mostrará en la UI al `ADMINISTRADOR` para que la comunique manualmente).
- **Pregunta**: ¿Cuál es la política de contraseñas (longitud mínima, complejidad)?