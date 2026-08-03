# Investigaciones y Decisiones Técnicas: Feature 014 - Control de Plazos, Semáforos y Alertas

## 1. Cálculo de Días Transcurridos (Days Elapsed)

### Decisión
Calcular los días transcurridos dinámicamente en memoria/servidor mediante la diferencia en milisegundos entre la fecha actual y la fecha de recepción (`receptionDate` / `receivedAt` / `createdAt`).

```typescript
export function calculateDaysElapsed(startDate: Date | string | null | undefined): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
```

### Razón Técnica
Evita guardar un contador estático en base de datos que requeriría tareas cron de actualización nocturna. El cálculo en tiempo de consulta en servidor garantiza precisión en tiempo real.

---

## 2. Reglas de Negocio para el Semáforo de Morosidad

### Decisión
Definir 3 niveles de severidad para el semáforo visual:

| Días Transcurridos ($N$) | Nivel de Severidad | Color / Insignia | Estado de Plazo |
| :--- | :--- | :--- | :--- |
| $N \le 2$ | **NORMAL** | Verde (`bg-emerald-100 text-emerald-800`) | En plazo |
| $3 \le N \le 4$ | **ATENCION** | Amarillo / Naranja (`bg-amber-100 text-amber-800`) | Próximo a vencer |
| $N \ge 5$ | **ALERTA** | Rojo Destacado (`bg-rose-100 text-rose-800 animate-pulse`) | Trámite Vencido / Mora |

---

## 3. Notificación Emergente / Modal al Iniciar Sesión

### Decisión
Crear un componente client `<OverdueNotificationModal />` que consulte trámites con mora ($> 5$ días) en la Bandeja de Entrante y Pendientes del usuario autenticado.
Si existen trámites en alerta roja, se despliega un diálogo emergente con el desglose de documentos que requieren atención urgente.
