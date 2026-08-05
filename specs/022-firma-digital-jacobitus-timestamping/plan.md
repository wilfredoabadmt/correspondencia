# Plan Técnico: Feature 022 - Integración con Firma Digital Jacobitus / AGETIC & Sellado de Tiempo (Timestamping)

## 1. Modificaciones en el Esquema Drizzle (`db/schema.ts`)

Añadir metadatos de certificado TSA a `documents`:
- `signedCertificateSubject`: `text('signed_certificate_subject')` (Ej. `CN=JUAN PEREZ, CI=1234567`)
- `signedCertificateIssuer`: `text('signed_certificate_issuer')` (Ej. `ADSIB - Entidad Certificadora Pública`)
- `timestampAuthority`: `text('timestamp_authority')` (Ej. `TSA-AGETIC-BO`)
- `timestampedAt`: `timestamp('timestamped_at')`

---

## 2. Servicios de Integración y Adaptadores Backend

- `src/modules/firma-digital/core/jacobitus.service.ts` — Interfaz para cliente Jacobitus FIDO REST.
- `src/modules/firma-digital/infra/jacobitus-rest.service.ts` — Adaptador HTTP para API Jacobitus (FIDO localhost / AGETIC token server).
- `src/modules/firma-digital/infra/tsa-timestamp.service.ts` — Servicio de sellado de tiempo RFC 3161 TSA.
- `src/modules/gestion-documental/application/sign-document-jacobitus.use-case.ts` — Servicio de aplicación para coordinar firma PAdES + TSA.

---

## 3. Interfaces de Usuario (UI Frontend)

- Modal `JacobitusSignModal` (`src/modules/firma-digital/components/jacobitus-sign-modal.tsx`):
  - Detección de servicios Jacobitus locales/FIDO.
  - Selección de token/slot y PIN del usuario.
- Card `DigitalCertificateBadge` (`src/modules/firma-digital/components/digital-certificate-badge.tsx`):
  - Visualización formal de firmas PAdES y sello de tiempo TSA en el detalle del documento `/documents/[id]`.
- API Endpoints:
  - `POST /api/documents/[documentId]/sign-jacobitus`
  - `GET /api/documents/[documentId]/certificate-info`
