# Plan Técnico: 008 - Visualizar Historial de un Documento

## 1. Objetivo

Implementar una sección en la página de detalle del documento (`/documents/[documentId]`) que muestre una lista cronológica de todos sus movimientos de derivación, proporcionando una trazabilidad completa.

## 2. Arquitectura y Estrategia

La estrategia se centrará en extender la página de detalle existente y crear un nuevo flujo de datos dedicado para obtener el historial, manteniendo la separación de responsabilidades.

1.  **Obtención de Datos en Paralelo**: En la página de detalle del documento (`page.tsx`), que es un Server Component, se realizarán dos llamadas a casos de uso en paralelo usando `Promise.all`:
    -   La llamada existente a `GetDocumentDetailsUseCase` para los datos principales del documento.
    -   Una nueva llamada a `GetDocumentHistoryUseCase` para obtener la lista de eventos del historial.
    Esto asegura que la carga de la página no se vea bloqueada secuencialmente y se mantenga eficiente.

2.  **Nuevo Repositorio y Caso de Uso**: Para mantener la cohesión y seguir el principio de responsabilidad única, se creará un nuevo repositorio (`IDocumentHistoryRepository`) y un nuevo caso de uso (`GetDocumentHistoryUseCase`) específicamente para la entidad `DocumentHistory`. Esto evita sobrecargar el `IDocumentRepository` con responsabilidades que no le corresponden directamente.

3.  **Consulta Optimizada con JOINs**: La implementación del repositorio del historial (`DrizzleDocumentHistoryRepository`) realizará una única consulta a la base de datos. Esta consulta utilizará `JOIN`s para obtener los nombres del usuario, el área de origen y el área de destino, en lugar de solo sus IDs. Se usarán alias en los `JOIN`s a la tabla `areaHierarchy` para poder distinguir entre "origen" y "destino".

4.  **Componentización de la UI**: La visualización del historial se encapsulará en un nuevo componente de presentación, `DocumentHistoryTimeline.tsx`. Este componente recibirá la lista de eventos del historial y se encargará de renderizarla de forma clara y cronológica. También manejará el estado vacío, mostrando un mensaje cuando no existan movimientos.

## 3. Data Layer: Nuevo Repositorio

-   **`IDocumentHistoryRepository` (`src/modules/gestion-documental/core/document-history.repository.ts`)**:
    -   Se creará una nueva interfaz de repositorio.
    -   Tendrá un único método: `findByDocumentId(documentId: string): Promise<HistoryEntry[]>`.
    -   Se definirá el tipo `HistoryEntry`, que contendrá los campos de `document_history` más los nombres obtenidos de los `JOIN`s (`fromAreaName`, `toAreaName`, `userName`).

-   **`DrizzleDocumentHistoryRepository` (`src/modules/gestion-documental/infra/drizzle-document-history.repository.ts`)**:
    -   Implementará la interfaz `IDocumentHistoryRepository`.
    -   El método `findByDocumentId` construirá una consulta Drizzle que:
        -   Filtre `document_history` por `documentId`.
        -   Haga `JOIN` con `users` sobre `userId`.
        -   Haga `JOIN` con `areaHierarchy` (con alias `fromArea`) sobre `fromAreaId`.
        -   Haga `JOIN` con `areaHierarchy` (con alias `toArea`) sobre `toAreaId`.
        -   Ordene los resultados por `createdAt` en orden descendente.

## 4. Application Layer: Caso de Uso

-   **`GetDocumentHistoryUseCase` (`src/modules/gestion-documental/application/get-document-history.use-case.ts`)**:
    -   Recibirá `{ documentId: string }`.
    -   Llamará a `documentHistoryRepository.findByDocumentId`.
    -   Devolverá la lista de `HistoryEntry`. La seguridad está garantizada porque el `documentId` que se le pasa ya ha sido validado contra la organización del usuario en la capa de presentación.

## 5. Presentation Layer (UI)

-   **Página de Detalle (`/documents/[documentId]/page.tsx`)**:
    -   Se modificará para invocar el nuevo `GetDocumentHistoryUseCase` en paralelo con el `GetDocumentDetailsUseCase`.
    -   Pasará la lista de eventos del historial al nuevo componente `DocumentHistoryTimeline.tsx`.

-   **Componente de Historial (`src/components/document/document-history-timeline.tsx`)**:
    -   Será un componente de presentación simple (puede ser RSC).
    -   Recibirá `history: HistoryEntry[]` como prop.
    -   Renderizará la lista de eventos, mostrando la información relevante de cada uno.
    -   Si el array `history` está vacío, mostrará el mensaje "Este documento aún no tiene historial de movimientos."

## 6. Tareas de Implementación

-   **Backend**:
    -   [ ] Crear la interfaz `IDocumentHistoryRepository` y el tipo `HistoryEntry`.
    -   [ ] Implementar `DrizzleDocumentHistoryRepository` con la consulta de `JOIN`s.
    -   [ ] Crear el `GetDocumentHistoryUseCase`.
    -   [ ] Registrar el nuevo repositorio y caso de uso en el contenedor de `tsyringe`.

-   **Frontend**:
    -   [ ] Crear el componente `DocumentHistoryTimeline.tsx` para visualizar la lista de eventos.
    -   [ ] Modificar la página de detalle (`page.tsx`) para obtener y pasar los datos del historial al nuevo componente.

-   **Tests**:
    -   [ ] Añadir pruebas de integración para `GetDocumentHistoryUseCase` que verifiquen que la consulta devuelve los datos enriquecidos correctamente.
    -   [ ] Añadir pruebas de componentes para `DocumentHistoryTimeline.tsx` para verificar:
        -   El renderizado correcto de un evento.
        -   El manejo del estado vacío.