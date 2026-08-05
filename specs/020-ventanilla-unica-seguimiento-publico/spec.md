# Especificación Funcional: Feature 020 - Ventanilla Única y Seguimiento Público para Ciudadanos

## 1. Contexto y Objetivos

La **Ventanilla Única y Seguimiento Público para Ciudadanos** (módulo adaptado de LONDRA AGETIC) tiene como objetivo aperturar el sistema a los trámites externos de la ciudadanía e instituciones externas.

Proporciona dos componentes clave:
1. **Portal Público de Seguimiento (`/seguimiento`)**: Permite a cualquier ciudadano o remitente consultar el estado en tiempo real de su trámite ingresando su Código CITE o de Seguimiento, sin necesidad de iniciar sesión.
2. **Registro de Ventanilla Única (`/ventanilla`)**: Módulo especializado para operadores de recepción externa que registra remitentes externos (CI/NIT, Nombre, Entidad, Teléfono, Correo) y emite un **Comprobante Oficial de Recepción** con QR impreso.

---

## 2. Historias de Usuario

### Historia 1: Registro en Ventanilla Única
> **Como** Operador de Ventanilla Única,  
> **Quiero** registrar documentos ingresados por ciudadanos o instituciones externas capturando sus datos de contacto (CI/NIT, Nombre, Teléfono, Correo),  
> **Para** asignarles un CITE automático de entrada e imprimir su Comprobante de Recepción.

### Historia 2: Consulta Pública de Trámites por el Ciudadano
> **Como** Ciudadano / Remitente Externo,  
> **Quiero** ingresar al portal público `/seguimiento` introduciendo mi Código de Seguimiento o CITE,  
> **Para** verificar en qué área se encuentra mi trámite, su estado de avance y la fecha de última actualización.

### Historia 3: Emisión de Comprobante de Recepción con QR
> **Como** Operador de Ventanilla Única,  
> **Quiero** generar un comprobante PDF con un código QR directo a `/seguimiento?codigo=...`,  
> **Para** entregarlo físicamente o enviarlo por correo al ciudadano.

---

## 3. Criterios de Aceptación (Behavioral Requirements)

### Escenario 1: Registro Extendido de Remitente Externo
- **Dado** que un operador registra un trámite en `/ventanilla`,
- **Cuando** completa el formulario de remitente externo (CI/NIT, Nombre, Entidad, Correo, Teléfono),
- **Entonces** el documento se guarda con la bandera `isExternal=true`, asociando los datos de contacto y asignando el CITE automático configurado para la entidad.

### Escenario 2: Portal Público de Seguimiento Sanitizado
- **Dado** un visitante anónimo en `/seguimiento?codigo=AEV/DG-TIC/INF/N°0001/2026`,
- **Cuando** consulta un código válido,
- **Entonces** se visualiza la línea del tiempo pública mostrando únicamente información no confidencial (Área actual, Estado, Fecha de recepción, Fecha estimada de respuesta), protegiendo datos internos sensibles.

### Escenario 3: Generación del Comprobante PDF de Recepción
- **Dado** un trámite registrado en Ventanilla Única,
- **Cuando** el operador hace clic en "Imprimir Comprobante",
- **Entonces** se descarga un archivo PDF de recibo institucional que contiene el logotipo de la entidad, metadatos del trámite y el código QR de seguimiento.
