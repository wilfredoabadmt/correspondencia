# Especificación Funcional: Feature 022 - Integración con Firma Digital Jacobitus / AGETIC & Sellado de Tiempo (Timestamping)

## 1. Contexto y Objetivos

Integración oficial de la Firma Digital de Bolivia (Jacobitus FIDO / AGETIC) y Sellado de Tiempo (Timestamping TSA - Time Stamping Authority).

Permite:
1. **Firma Digital con Certificado Digital / Jacobitus (Softoken & Token USB)**: Integración con API Jacobitus FIDO de AGETIC para firmar digitalmente archivos PDF de documentos y Hojas de Ruta de forma estándar PKCS#7 / PAdES.
2. **Sellado de Tiempo (TSA Timestamping)**: Estampar una fecha/hora infalsificable emitida por una TSA oficial (ADSIB / AGETIC).
3. **Validador e Inspector de Firma**: Previsualizar metadatos de los certificados (Titular, CI, Entidad Emisora ADSIB/ATT, Validez y Sello de Tiempo) en el visor de documentos.

---

## 2. Historias de Usuario

### Historia 1: Firma Digital Vía Jacobitus FIDO / AGETIC
> **Como** Servidor Público / Autoridad,  
> **Quiero** firmar un documento PDF mediante el servicio de firma digital Jacobitus (Token físico o Certificado Digital),  
> **Para** otorgar validez jurídica y legal al trámite conforme a la Ley N° 164.

### Historia 2: Estampado de Sello de Tiempo (Timestamping)
> **Como** Institución Pública,  
> **Quiero** incorporar un sello de tiempo oficial TSA en las firmas digitales de los documentos,  
> **Para** certificar de forma irrefutable el momento exacto en que fue firmado o recepcionado el documento.

### Historia 3: Auditoría y Verificación de Certificados
> **Como** Auditor / Ciudadano / Servidor Público,  
> **Quiero** consultar los detalles del certificado digital (Nombre, CI, Entidad Certificadora, Validez) desde la plataforma,  
> **Para** verificar que la firma no ha sido alterada ni revocada.

---

## 3. Criterios de Aceptación (Behavioral Requirements)

### Escenario 1: Proceso de Firma Digital Jacobitus
- **Dado** un documento PDF cargado en el sistema,
- **Cuando** la autoridad hace clic en *"Firmar con Jacobitus"*,
- **Entonces** la aplicación se comunica con el servicio Jacobitus FIDO (puerto local 9000/API REST), realiza el digest SHA-256 del documento, estampa la firma PAdES y guarda el PDF firmado en R2/Storage con el sello de tiempo TSA.

### Escenario 2: Inspección de Certificado y Sello de Tiempo
- **Dado** un documento firmado digitalmente,
- **Cuando** se visualiza su detalle `/documents/[id]`,
- **Entonces** el sistema despliega un panel *"Firma Digital Avanzada & TSA"* detallando el nombre del titular, emisor (ej: ADSIB), fecha exacta TSA y hash de verificación.
