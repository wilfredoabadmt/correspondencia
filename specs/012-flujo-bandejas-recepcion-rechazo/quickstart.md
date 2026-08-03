# Guía de Validación Rápida (Quickstart): Feature 012 - Flujo Completo de Bandejas

## 1. Escenario E2E: Recepción y Derivación Formal

1. Iniciar sesión con **Usuario A (Mesa de Partes)**.
2. Registrar un nuevo documento e iniciar trámite.
3. Derivar el documento a **Usuario B (Jefe de Unidad)**.
4. Iniciar sesión con **Usuario B**:
   - Navegar a **Bandeja Entrante**.
   - Verificar que el trámite aparece en estado `PENDIENTE_RECEPCION`.
   - Hacer clic en **[Recibir]**.
   - Verificar que el documento pasa a la **Bandeja de Pendientes** de Usuario B con estado `RECIBIDO`.

---

## 2. Escenario E2E: Rechazo de Correspondencia

1. Iniciar sesión con **Usuario A**.
2. Derivar un documento a **Usuario C**.
3. Iniciar sesión con **Usuario C**:
   - Navegar a **Bandeja Entrante**.
   - Hacer clic en **[Rechazar]**.
   - Ingresar el motivo obligatorio: *"Documento sin adjunto físico original"*.
   - Confirmar.
4. Verificar que el documento retorne a la **Bandeja de Pendientes** de **Usuario A** en estado `RECHAZADO` mostrando el motivo.

---

## 3. Escenario E2E: Cancelación de Derivación

1. Iniciar sesión con **Usuario A**.
2. Derivar un documento a **Usuario B**.
3. Ir inmediatamente a la **Bandeja de Enviados** de Usuario A.
4. Hacer clic en **[Cancelar Derivación]**.
5. Verificar que la derivación se cancele y el documento retorne a los Pendientes de Usuario A antes de que B lo reciba.

---

## 4. Escenario E2E: Agrupar y Archivar Documentación

1. En la **Bandeja de Pendientes**, seleccionar dos trámites.
2. Hacer clic en **[Agrupar]** y marcar uno de ellos como Principal.
3. Hacer clic en **[Archivar]**, seleccionar la carpeta `GESTION-2026` y guardar.
4. Ir a la **Bandeja de Archivados**, abrir la carpeta `GESTION-2026` y verificar la custodia del trámite.
5. Hacer clic en **[Quitar de Archivo]** y verificar que retorne a Pendientes.
