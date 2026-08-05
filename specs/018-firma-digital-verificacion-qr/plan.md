# Plan Técnico: Feature 018 - Firma Digital y Verificación QR

## 1. Arquitectura y Estrategia de Implementación

### Modificaciones en el Esquema de Base de Datos (`db/schema.ts`)
Añadir a la tabla `documents`:
- `isSigned`: `boolean('is_signed').default(false)`
- `signedAt`: `timestamp('signed_at')`
- `signedByUserId`: `text('signed_by_user_id')`
- `signatureHash`: `text('signature_hash')`
- `verificationCode`: `text('verification_code')` (con `uniqueIndex`)

---

## 2. Componentes Afectados y Nuevos Archivos

```
src/
├── app/
│   ├── api/
│   │   ├── documents/
│   │   │   └── [documentId]/
│   │   │       └── sign/
│   │   │           └── route.ts             # POST: Firmar documento
│   │   └── public/
│   │       └── verify/
│   │           └── [code]/
│   │               └── route.ts             # GET: Consulta pública de verificación
│   └── verificar/
│       └── [code]/
│           └── page.tsx                     # UI Pública de verificación de QR
├── modules/
│   └── gestion-documental/
│       ├── application/
│       │   ├── sign-document.use-case.ts
│       │   ├── sign-document.use-case.impl.ts
│       │   ├── verify-document.use-case.ts
│       │   └── verify-document.use-case.impl.ts
│       └── components/
│           ├── digital-signature-badge.tsx  # Badge de estado de firma
│           └── sign-document-modal.tsx      # Modal de confirmación de firma
```

---

## 3. Generación de QR e Integración en PDF

1. **Generación de QR**: Utilizar el paquete `qrcode` para convertir la URL pública de verificación (`https://.../verificar/[code]`) a Data URL PNG.
2. **Inclusión en Hoja de Ruta PDF**: Actualizar `generate-routing-slip-pdf.use-case.impl.ts` para renderizar el QR e instrucciones de validación en la esquina inferior del PDF.

---

## 4. Plan de Pruebas

- **Prueba Unitaria de Firma**: Verificar que `SignDocumentUseCase` genere correctamente el hash SHA-256 y asigne un `verificationCode` único.
- **Prueba Unitaria de Verificación Pública**: Verificar que `VerifyDocumentUseCase` retorne únicamente los campos públicos y maneje códigos inexistentes.
- **Prueba de Typecheck y Build**: `pnpm typecheck`, `pnpm test`, `pnpm build`.
