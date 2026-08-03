# Guía de Validación Rápida (Quickstart): Feature 014 - Control de Plazos, Semáforos y Alertas

## 1. Escenario E2E: Visualización de Semáforos en Bandejas

1. Navegar a la **Bandeja de Pendientes** (`/inbox/pending`) o **Bandeja Entrante** (`/inbox/incoming`).
2. Verificar la columna **Días Transcurridos**:
   - Documentos con $\le 2$ días de antigüedad muestran insignia **verde** (`0-2 días`).
   - Documentos con $3-4$ días muestran insignia **amarilla** (`3-4 días`).
   - Documentos con $\ge 5$ días muestran insignia **roja destacada** (`X días (Vencido)`).

---

## 2. Escenario E2E: Modal de Notificación de Mora al Iniciar Sesión

1. Iniciar sesión con un usuario que posea trámites pendientes recepcionados hace más de 5 días.
2. Al ingresar al Dashboard (`/dashboard`), se debe desplegar automáticamente el modal emergente **"Notificación de Trámites con Morosidad"**.
3. Verificar que el modal liste los trámites vencidos y contenga botones directos para atenderlos.
