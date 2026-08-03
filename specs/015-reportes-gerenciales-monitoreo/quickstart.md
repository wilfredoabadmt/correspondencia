# Guía de Validación Rápida (Quickstart): Feature 015 - Reportes Gerenciales y Exportaciones

## 1. Escenario E2E: Consulta de Reportes y Filtros

1. Navegar a la página de **Reportes Gerenciales** (`/reports`) desde la barra lateral.
2. Seleccionar filtros (ej. Rango de Fechas o Estado `Recibido`).
3. Hacer clic en **[Filtrar / Consultar]**:
   - Verificar que se actualicen las tarjetas de resumen (Total, Pendientes, En Mora).
   - Verificar que la tabla muestre la correspondencia filtrada con sus respectivos semáforos de días.

---

## 2. Escenario E2E: Exportación a Excel (`.xlsx`) y PDF

1. En la vista `/reports`, hacer clic en **[Exportar a Excel (.xlsx)]**.
2. Abrir el archivo `.xlsx` descargado:
   - Verificar que la cabecera tenga estilo profesional.
   - Verificar que todas las columnas de la consulta estén correctamente pobladas.
3. Hacer clic en **[Exportar a PDF]**:
   - Verificar la descarga/apertura del PDF gerencial con membrete institucional y resumen de totales.
