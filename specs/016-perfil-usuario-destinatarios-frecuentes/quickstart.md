# Guía de Validación Rápida (Quickstart): Feature 016 - Perfil de Usuario y Destinatarios Frecuentes

## 1. Escenario E2E: Actualización de Perfil y Cambio de Contraseña

1. Iniciar sesión y navegar a `/profile` haciendo clic en el perfil del usuario.
2. Actualizar el nombre del usuario y guardar cambios.
3. En la sección **Cambiar Contraseña**:
   - Ingresar contraseña actual incorrecta $\rightarrow$ Verificar mensaje de error.
   - Ingresar contraseña actual correcta y nueva contraseña $\rightarrow$ Verificar confirmación de éxito.

---

## 2. Escenario E2E: Gestión y Selección de Destinatarios Frecuentes

1. En la vista `/profile`, agregar un área a la lista de **Destinatarios Frecuentes**.
2. Abrir la pantalla o modal de derivación de cualquier documento (`/documents/[id]`).
3. Verificar que aparezca la sección **⭐ Frecuentes** en la parte superior y que hacer clic en el botón seleccione automáticamente el área de destino.
