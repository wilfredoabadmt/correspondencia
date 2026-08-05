# Especificación Funcional: Feature 018 - Firma Digital y Verificación QR

## 1. Contexto y Objetivos

El objetivo de esta característica es dotar a **GestorDoc** de capacidad para firmar digitalmente documentos y Hojas de Ruta oficiales, incorporando un **código QR de validación** impreso en los documentos PDF generados. Cualquier ciudadano o servidor público podrá escanear el código QR para verificar la autenticidad e integridad del documento en un portal público de verificación.

---

## 2. Historias de Usuario

### Historia 1: Firma Digital de Documento u Hoja de Ruta
> **Como** Servidor Público (Remitente/Aprobador),  
> **Quiero** firmar digitalmente un documento o la Hoja de Ruta generada antes de su derivación u oficialización,  
> **Para** certificar legalmente la autoría y la inmutabilidad del contenido.

### Historia 2: Generación de QR en Hoja de Ruta PDF
> **Como** Servidor Público u Operador,  
> **Quiero** que la Hoja de Ruta en PDF incluya un código QR con un enlace de verificación único,  
> **Para** que cualquier persona receptora del papel o del PDF pueda validar su autenticidad.

### Historia 3: Portal de Verificación Pública
> **Como** Receptora o Tercero (Ciudadano / Otra Institución),  
> **Quiero** escanear el código QR o ingresar el código de verificación en `/verificar/[code]`,  
> **Para** comprobar si el documento fue firmado digitalmente, quién lo firmó, la fecha/hora y si no ha sido alterado.

---

## 3. Criterios de Aceptación (Behavioral Requirements)

### Escenario 1: Proceso de Firma Digital
- **Dado** un documento o Hoja de Ruta en estado pendiente de aprobación o emisión,
- **Cuando** el usuario autorizado presiona "Firmar Digitalmente",
- **Entonces** el sistema registra el sello digital (hash SHA-256 del contenido + metadatos del firmante + timestamp) y actualiza el estado del documento a `FIRMADO`.

### Escenario 2: Emisión del PDF con QR de Verificación
- **Dado** un documento con estado `FIRMADO`,
- **Cuando** se genera la Hoja de Ruta PDF (o se descarga el documento oficial),
- **Entonces** la última hoja incluye en el pie de página un código QR legible que apunta a `https://[dominio]/verificar/[verificationCode]`.

### Escenario 3: Verificación Pública
- **Dado** que un usuario ingresa a la URL del QR o escribe la URL `/verificar/[verificationCode]`,
- **Cuando** carga la página pública (sin requerir inicio de sesión),
- **Entonces** el sistema muestra:
  1. Estado de validez (Verde: "Documento Auténtico y Firmado", Rojo: "No encontrado o Alterado").
  2. CITE o Código de Seguimiento.
  3. Asunto (sin revelar datos confidenciales/sensibles si la política lo prohíbe).
  4. Nombre del firmante, cargo, organización y fecha de firma.
  5. Hash de verificación SHA-256.

---

## 4. Restricciones Técnicas y de Seguridad

1. **Aislamiento Multi-Tenant**: Las acciones de firma requieren comprobación estricta de `organizationId` y rol/permiso correspondiente en el servidor.
2. **Página Pública**: La ruta `/verificar/[verificationCode]` debe ser accesible públicamente sin autenticación, pero limitando los datos expuestos únicamente al metadato de verificación pública.
3. **Imputabilidad e Inmutabilidad**: Una vez que un documento es marcado como `FIRMADO`, no se permite la edición de su asunto ni de su archivo adjunto principal.
