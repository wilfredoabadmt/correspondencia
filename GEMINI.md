# GestorDoc — Guía para Gemini CLI

> Este `GEMINI.md` es el **archivo de contexto persistente para Gemini CLI**. Define las reglas operativas, el stack y el flujo de trabajo para este repositorio. No es un prompt para el chat web.

## 1. Feature Activa: 013-plantillas-word-hoja-ruta-pdf

- **Constitución**: `.specify/memory/constitution.md`
- **Spec**: `specs/013-plantillas-word-hoja-ruta-pdf/spec.md`

## Features Previas (archivadas en `specs/`)
- **012-flujo-bandejas-recepcion-rechazo**: Implementación del flujo completo de bandejas (Entrante, Pendientes, Enviados, Archivados) con acciones de custodia.
- **011-gestion-roles-permisos**: Implementada la gestión de roles personalizados y permisos granulares por organización.
- **010-gestion-usuarios-roles**: Implementada la gestión de usuarios y roles por organización.
- **009-paginar-historial-documento**: Implementada la paginación del historial de documentos.
- **008-visualizar-historial-documento**: Implementada la visualización del historial de un documento.
- **007-derivar-documento**: Implementada la acción de derivar un documento a otra área.
- **006-listar-filtrar-documentos**: Implementada la página para listar y buscar documentos.
- **005-ver-detalle-documento**: Implementada la página de detalle con protección IDOR.
- **004-dashboard-principal**: Implementado el Dashboard Principal.
- **001-registrar-documento-entrante**: Registro de documento entrante.
- **002-gestionar-jerarquias-area**: CRUD de jerarquías de área.

## 2. Próximas Features (Propuestas)

- **Feature 014: Control de Plazos, Semáforos y Alertas**: Control de días transcurridos, alertas visuales > 5 días y notificaciones.
- **Feature 015: Reportes Gerenciales y Monitoreo**: Módulo de consulta gerencial y exportaciones Excel/PDF.


## 2. Stack y Arquitectura

**Stack**: Next.js (App Router) + TypeScript estricto (`strict` + `noUncheckedIndexedAccess`) · UI con Tailwind CSS + shadcn/ui · Drizzle ORM + PostgreSQL (self-hosted en Coolify) · Auth con Better Auth + plugin de organizaciones (para multi-tenancy) · Validación con Zod · Almacenamiento de objetos en Cloudflare R2 (vía interfaz S3 estándar) · Gestor de paquetes pnpm · Deploy en Coolify sobre un VPS.

**Arquitectura**: Modular monolith desplegable. El código se organiza por módulos de dominio con límites claros. Las integraciones externas se encapsulan en adaptadores.

**Fuentes de Verdad**:
1.  **Constitución**: `.specify/memory/constitution.md` (reglas no negociables).
2.  **Especificación activa**: Comportamiento observable (el *qué* y el *porqué*).
3.  **Plan técnico**: Arquitectura y estrategia de implementación (el *cómo*).

## 3. Flujo de Trabajo: SDD con Spec Kit

Trabajamos con **Spec-Driven Development (SDD)**. El flujo para cada feature es incremental:

```
/speckit.constitution  →  /speckit.specify  →  /speckit.plan  →  /speckit.tasks  →  /speckit.implement
```

- **Tu rol (Gemini CLI)** es ejecutar este flujo dentro del repositorio.
- Los comandos `/speckit.*` están disponibles en `.gemini/commands/`.
- La validación de la idea y la preparación de los prompts de arranque (`constitution` y `specify`) se hacen fuera de esta sesión, en Gemini web, usando `GEMINI-HELPER.md`. Aquí se implementa.

## 4. Protocolo Operativo (Reglas para Gemini CLI)

Actúa siempre como un ingeniero de software senior, siguiendo estas reglas no negociables:

1.  **Inspeccionar antes de modificar**: Antes de escribir código, lee este `GEMINI.md`, la constitución, la spec activa, el plan, las tareas, el estado de Git y los archivos relevantes. No asumas el estado del proyecto.
2.  **Evidencia antes que afirmaciones**: No declares que algo funciona sin mostrar qué se verificó, con qué comando, sobre qué entorno y cuál fue el resultado. "Ya quedó" no es una respuesta válida sin evidencia.
3.  **Cambios mínimos y trazables**: Modifica únicamente lo necesario para cumplir la tarea activa. Evita refactors no solicitados. Cada commit debe ser pequeño y atómico.
4.  **No degradar silenciosamente**: Si una prueba, restricción de seguridad o validación impide avanzar, no la elimines ni la comentes. Corrige la causa raíz o solicita una decisión explícita para modificar la restricción.
5.  **Seguridad por defecto**:
    - Nunca manejes secretos en claro. Usa placeholders de variables de entorno (`.env.example`).
    - Valida toda entrada externa.
    - Aplica autorización en el servidor para cada acción.
    - No ejecutes comandos destructivos (`rm -rf`, `git push --force`, reset de BD) sin autorización explícita y un plan de rollback.

## 5. Definición de "Hecho" (Quality Gate)

Una tarea o feature solo se considera "Hecha" cuando cumple **todos** estos puntos:

- **Pasa el gate técnico**: `[comando de typecheck]`, `[comando de lint]`, `[comando de build]` y las pruebas (`[comando de tests]`) están en verde.
- **Cumple la spec**: El comportamiento implementado coincide con los criterios de aceptación de la `spec.md`.
- **Verificación en vivo (si aplica)**: Para features con comportamiento observable (UI, API, mensajería), se debe ejecutar una prueba de punta a punta que simule el flujo de usuario real. Un `200 OK` no es suficiente.
- **Evidencia presentada**: El reporte final incluye los comandos ejecutados, los resultados, los archivos modificados y la evidencia de la verificación en vivo.
- **No hay regresiones**: No se rompe el aislamiento de tenants, los permisos, la compatibilidad hacia atrás (si se requiere) ni las migraciones.

## 6. Comandos de Verificación del Proyecto

- **Instalación**: `pnpm install`
- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Pruebas**: `pnpm test`
- **Build**: `pnpm build`

Usa estos comandos para verificar tu trabajo antes de declararlo "Hecho".