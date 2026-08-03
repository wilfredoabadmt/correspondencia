# Especificación: 014 - Control de Plazos, Semáforos de Mora y Alertas

Describe QUÉ debe ocurrir y POR QUÉ, sin decidir todavía frameworks, tablas, librerías o estructura de archivos.

## CONTEXTO
- **Producto**: GestorDoc, un Sistema de Gestión de Correspondencia y Trámite Documentario.
- **Problema validado**: En las instituciones públicas y empresas, la atención oportuna de la correspondencia es un requisito legal y operativo. Actualmente, los usuarios y directores no cuentan con un mecanismo automático que contabilice los días transcurridos desde que se recepcionó un trámite ni con alertas visuales que destaquen la morosidad. Se requiere implementar el **conteo automático de días transcurridos**, **semáforos visuales de color** (Verde = normal, Amarillo = atención requerida, Rojo = atraso > 5 días) y un **banner/modal de notificación al iniciar sesión** informando los trámites vencidos bajo custodia del usuario.
- **Usuario/rol principal**: Servidores públicos, Jefes de Unidad, Directores y Mesa de Partes.
- **Feature**: Semáforos de morosidad, indicador de días transcurridos y notificaciones de trámites pendientes.
- **Resultado de negocio**: Reducir el tiempo promedio de atención de trámites, evitar el abandono de correspondencia e incrementar la transparencia institucional.

---

## HISTORIAS DE USUARIO

1. **Semáforos Visuales e Indicador de Días Transcurridos**:
   - Como `USUARIO EN CUSTODIA`, quiero ver en cada tarjeta/fila de mi Bandeja de Pendientes y Entrante una insignia de color y el número exacto de días transcurridos desde la recepción (`X días`).
   - El color de la insignia debe cambiar automáticamente según los días:
     - **Verde**: $\le 2$ días transcurridos (Dentro de plazo normal).
     - **Amarillo/Naranja**: $3 - 4$ días transcurridos (Próximo a vencer).
     - **Rojo Destacado**: $> 5$ días transcurridos (Trámite con mora / Alerta).

2. **Alerta / Modal de Notificación al Iniciar Sesión**:
   - Como `USUARIO AUTENTICADO`, al ingresar al sistema o cargar la pantalla principal quiero ver un modal emergente o aviso destacado si tengo trámites con más de 5 días de retraso sin atención, listando los trámites urgentes para su atención inmediata.

3. **Indicadores de Mora en el Dashboard**:
   - Como `DIRECTOR / JEFE DE UNIDAD`, quiero ver en el Dashboard principal gráficos estadísticos e indicadores de trámites en plazo vs trámites con morosidad (> 5 días) por área y por usuario.

---

## ALCANCE

### Dentro:
- Cálculo dinámico de días transcurridos en servidor a partir de `receptionDate` o `receivedAt`.
- Componente de semáforo visual `<StatusBadge daysElapsed={n} />` aplicable en todas las tablas de bandejas.
- Modal de aviso de morosidad en la vista inicial si existen trámites pendientes $> 5$ días.
- Actualización del Dashboard para mostrar métricas de mora.

### Fuera por ahora:
- Envío de correos electrónicos externos o SMS (las notificaciones ocurren dentro del sistema web).
