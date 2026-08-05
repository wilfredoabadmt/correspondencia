# Especificación Funcional: Feature 023 - Gestión Multi-Rol de Usuarios y Cargos Institucionales por Área

## 1. Contexto y Objetivos

Evolución del modelo de control de acceso inspirado en **LONDRA (AGETIC)** para permitir que los usuarios tengan asignación de **Múltiples Roles Simultáneos** y un **Cargo Institucional Específico por Área**.

Permite:
1. **Asignación Multi-Rol por Usuario**: Un usuario puede poseer varios roles simultáneamente dentro de su organización (ej: *Servidor Público* + *Operador de Ventanilla Única* + *Administrador de Plantillas*).
2. **Cargo Institucional y Puesto de Trabajo**: Registrar la denominación de cargo oficial (ej: *Director de Tecnologías*, *Analista III*, *Secretaria Ejecutiva*) asociada al área organizacional del funcionario.
3. **Selector de Rol / Perfil Activo en Sesión**: Posibilidad de conmutar o consultar los permisos acumulados en la interfaz de usuario.

---

## 2. Historias de Usuario

### Historia 1: Asignación de Múltiples Roles por el Administrador
> **Como** Administrador de Entidad,  
> **Quiero** seleccionar uno o más roles para un servidor público desde la gestión de usuarios,  
> **Para** habilitar los permisos combinados necesarios para sus funciones diarias.

### Historia 2: Registro de Cargo Institucional
> **Como** Administrador / Usuario,  
> **Quiero** que mi perfil disponga de mi cargo oficial (ej. Director de Sistemas),  
> **Para** que mi nombre y cargo aparezcan correctamente impresos en las Hojas de Ruta y reportes institucionales.

---

## 3. Criterios de Aceptación (Behavioral Requirements)

### Escenario 1: Asignación Multi-Rol en Edición de Usuario
- **Dado** un usuario en `/admin/users`,
- **Cuando** el administrador le asigna los roles `usuario` y `operador_ventanilla`,
- **Entonces** el usuario puede acceder tanto a las bandejas institucionales como al módulo `/ventanilla` sin requerir dos cuentas distintas.

### Escenario 2: Visualización de Cargo en Hoja de Ruta e Historial
- **Dado** un documento derivado a un usuario con cargo *"Director de Tecnologías"*,
- **Cuando** se visualiza el historial o la Hoja de Ruta PDF,
- **Entonces** se despliega el nombre completo y el cargo institucional del servidor público.
