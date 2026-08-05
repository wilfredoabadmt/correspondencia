# Especificación Funcional: Feature 019 - Gestor de CITEs Automáticos Configurables

## 1. Contexto y Objetivos

El **Gestor de CITEs Automáticos** es un módulo administrativo e institucional (adaptado del sistema LONDRA de AGETIC) que permite a cada organización definir y automatizar la nomenclatura oficial de sus correspondencias y documentos.

Con esta funcionalidad, el sistema asignará correlativos únicos y configurables según el área organizacional, el tipo de documento (Informe, Nota Externa, Memo, etc.) y la gestión (año en curso).

---

## 2. Historias de Usuario

### Historia 1: Configuración de Nomenclaturas de CITE
> **Como** Administrador de Entidad,  
> **Quiero** definir patrones de CITE institucionales (ej: `{ENTIDAD}/{AREA}/{TIPO}/N°-{NUMERO}/{AÑO}`),  
> **Para** estandarizar la codificación de documentos oficiales en toda la entidad.

### Historia 2: Asignación Automática de CITE al Crear/Emitir Documentos
> **Como** Servidor Público / Operador,  
> **Quiero** que al registrar un nuevo documento el sistema reserve e incremente automáticamente el correlativo correspondiente,  
> **Para** evitar colisiones de CITEs, saltos manuales o duplicidades.

### Historia 3: Administración y Ajuste de Secuencias
> **Como** Administrador de Entidad,  
> **Quiero** consultar y ajustar manualmente el número correlativo actual de una secuencia o configurar su reseteo anual,  
> **Para** garantizar la continuidad de la numeración al migrar de un sistema previo o al cambiar de gestión.

---

## 3. Criterios de Aceptación (Behavioral Requirements)

### Escenario 1: Configuración de Formato de CITE
- **Dado** un Administrador en la sección administrativa `/admin/cites`,
- **Cuando** crea o modifica una regla para un tipo de documento y/o área específica,
- **Entonces** puede utilizar variables dinámicas como `{ENTIDAD}`, `{AREA}`, `{TIPO}`, `{NUMERO:4}` (con relleno de ceros) y `{AÑO}`, guardando la regla de forma aislada por `organizationId`.

### Escenario 2: Reserva Automática en Registro de Documento
- **Dado** que un usuario crea un documento tipo `INFORME` para el área `DG-TIC`,
- **Cuando** confirma el registro,
- **Entonces** el backend obtiene atómicamente el siguiente número en la secuencia activa, formatea la cadena de CITE (ej: `AEV/DG-TIC/INF/N°0042/2026`) y la asigna al campo `trackingCode`.

### Escenario 3: Reseteo Anual y Control de Concurrencia
- **Dado** que inicia un nuevo año fiscal (1 de enero),
- **Cuando** se solicita un nuevo CITE y la regla está marcada con `resetYearly=true`,
- **Entonces** la secuencia inicia automáticamente desde 1 para dicho año sin intervención manual.
