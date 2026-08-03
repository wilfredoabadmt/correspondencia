# Especificación: 016 - Opciones de Perfil de Usuario, Destinatarios Frecuentes y Cambio de Contraseña

Describe QUÉ debe ocurrir y POR QUÉ, sin decidir todavía frameworks, tablas, librerías o estructura de archivos.

## CONTEXTO
- **Producto**: GestorDoc, un Sistema de Gestión de Correspondencia y Trámite Documentario.
- **Problema validado**: Los usuarios del sistema requieren una sección autoservicio de **Perfil de Usuario** (`/profile`) donde puedan actualizar su nombre, correo electrónico, avatar y contraseña de forma segura. Además, para agilizar la derivación de correspondencia recurrente a los mismos compañeros o áreas de trabajo, el sistema debe permitir guardar y gestionar **Destinatarios Frecuentes** (contactos preferidos) que aparezcan como accesos rápidos en los formularios de derivación y registro.
- **Usuario/rol principal**: Todos los usuarios autenticados del sistema.
- **Feature**: Página `/profile`, cambio seguro de contraseña y gestión de accesos rápidos a destinatarios frecuentes.
- **Resultado de negocio**: Reducción del tiempo de llenado en derivaciones frecuentes, mayor personalización y cumplimiento de buenas prácticas de seguridad de contraseñas.

---

## HISTORIAS DE USUARIO

1. **Gestión de Perfil y Cambio de Contraseña**:
   - Como `USUARIO AUTENTICADO`, quiero ingresar a mi **Perfil** (`/profile`) para consultar mi rol, área asignada y actualizar mis datos personales.
   - Quiero tener una sección para **Cambiar Contraseña** que valide la contraseña actual y requiera confirmación de la nueva contraseña.

2. **Gestión de Destinatarios Frecuentes**:
   - Como `USUARIO OPERATIVO`, quiero marcar áreas o funcionarios como **Destinatarios Frecuentes** para que aparezcan destacados en la parte superior del selector al derivar un documento.

3. **Selección Rápida en Formularios**:
   - Como `REDACTOR / DERIVADOR`, al abrir el modal/pantalla de derivación quiero ver un bloque de **"Frecuentes"** para seleccionar el área de destino con un solo clic sin tener que buscar en la lista completa.

---

## ALCANCE

### Dentro:
- Vista de Perfil `/profile` con formulario de actualización de usuario y cambio de contraseña.
- Server Action / Caso de uso para cambio de contraseña con hashing `bcryptjs`.
- Tabla/Persistencia de destinatarios frecuentes por usuario (`userFavoriteRecipients`).
- Bloque de accesos rápidos a Frecuentes en el formulario de derivación.

### Fuera por ahora:
- Integración con directorio activo LDAP / Active Directory externo.
