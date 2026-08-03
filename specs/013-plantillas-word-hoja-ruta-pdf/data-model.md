# Modelo de Datos y Estructura de Plantillas: Feature 013

## 1. DTO de Variables para Plantilla Word (`DocxTemplateData`)

```typescript
export interface DocxTemplateData {
    citeCode: string; // ej. "AEV/DNP/UPDO_INF/Nro.0002/2026"
    dateStr: string; // ej. "15 de Enero de 2026"
    recipientName: string; // "JUAN JOSÉ ESPEJO CONDORI"
    recipientRole: string; // "DIRECTOR GENERAL EJECUTIVO"
    senderName: string; // "ANDREA PATRICIA CORTEZ TELLEZ"
    senderRole: string; // "RESPONSABLE EN SEGUIMIENTO Y CONTROL"
    viaName?: string | null;
    viaRole?: string | null;
    subject: string; // "INFORME DE SEGUIMIENTO Y EVALUACIÓN..."
    documentType: string; // "Informe", "Nota Interna", "Carta"
}
```

---

## 2. DTO de Datos para Hoja de Ruta Oficial PDF (`RoutingSlipPdfData`)

```typescript
export interface RoutingSlipHistoryItem {
    stepNumber: number;
    fromUser: string;
    toUser: string;
    action: string;
    instructionCode?: string | null;
    comment?: string | null;
    dateStr: string;
    isUrgent: boolean;
}

export interface RoutingSlipPdfData {
    routingSlipCode: string; // "I-2026-00546" o "E-2026-00123"
    citeCode: string;
    dateStr: string;
    timeStr: string;
    procedencia: string; // "AGENCIA ESTATAL DE VIVIENDA"
    remitente: string;
    destinatario: string;
    referencia: string;
    proceso: string;
    adjunto: string;
    hojas: number;
    proveidos: RoutingSlipHistoryItem[];
}
```
