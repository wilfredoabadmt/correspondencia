# Plan Técnico: Feature 020 - Ventanilla Única y Seguimiento Público para Ciudadanos

## 1. Modificaciones en la Base de Datos (`db/schema.ts`)

Añadir campos a la tabla `documents`:
```typescript
isExternal: boolean('is_external').default(false).notNull(),
applicantIdentityDocument: text('applicant_identity_document'), // CI / NIT
applicantName: text('applicant_name'),
applicantInstitution: text('applicant_institution'),
applicantPhone: text('applicant_phone'),
applicantEmail: text('applicant_email'),
```

---

## 2. Componentes Backend y Casos de Uso

- `src/modules/gestion-documental/application/get-public-tracking-info.use-case.ts`:
  Caso de uso desautenticado (público) que busca por `trackingCode` y devuelve únicamente el historial sanitario del trámite (Fechas, Nombre de Área, Estado general).
- `src/modules/gestion-documental/application/register-external-document.use-case.ts`:
  Caso de uso para que los operadores de Ventanilla Única registren correspondencia externa con datos completos de contacto del solicitante y generación automática de CITE.
- `src/app/api/public/tracking/[code]/route.ts`: API GET pública de seguimiento.

---

## 3. Interfaces de Usuario (UI Frontend)

- `src/app/seguimiento/page.tsx`: Portal web público accesible sin login para consultar trámites.
- `src/app/ventanilla/page.tsx`: Formulario de Ventanilla Única para recepción presencial/digital externa.
- `src/modules/gestion-documental/application/generate-receipt-pdf.use-case.ts`: Generación del comprobante PDF de recibo con código QR.
