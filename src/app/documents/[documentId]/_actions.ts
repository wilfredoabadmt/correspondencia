'use server';

import 'reflect-metadata'; // Required for tsyringe
import { container } from '~/core/container';
import { GetDocumentHistoryUseCase } from '~/modules/gestion-documental/application/get-document-history.use-case';
import { InjectionTokens } from '~/core/injection-tokens';
import { IDocumentHistoryRepository } from '~/modules/gestion-documental/core/document-history.repository';
import { DrizzleDocumentHistoryRepository } from '~/modules/gestion-documental/infra/drizzle-document-history.repository';
import { db } from '~/db';
import { auth } from '~/modules/auth/lib/auth';

// Regex para validar UUID v4 (el formato más común para IDs generados)
// Fuente: https://stackoverflow.com/questions/7905929/how-to-check-valid-uuid-guid
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(uuid: string): boolean {
    return UUID_V4_REGEX.test(uuid);
}

/**
 * Obtiene el ID de la organización del usuario autenticado desde la sesión.
 * Esta función es crítica para el aislamiento multi-tenant.
 *
 * @returns {Promise<string>} El ID de la organización.
 * @throws {Error} Si el usuario no está autenticado, no pertenece a una organización
 *                 o si el formato del ID de la organización es inválido.
 */
async function getCurrentOrganizationId(): Promise<string> {
    const session = await auth();

    if (!session || !session.user) {
        throw new Error('Unauthorized: User not authenticated.');
    }
    // Asumimos que el tipo de sesión de NextAuth.js ha sido extendido para incluir organizationId
    // en el objeto 'user'. Si no es así, se debería extender el tipo 'User' de NextAuth.
    if (!session.user.organizationId) {
        throw new Error('Unauthorized: User does not belong to an organization.');
    }
    if (typeof session.user.organizationId !== 'string' || session.user.organizationId.trim() === '') {
        throw new Error('Unauthorized: Invalid organization identifier format.');
    }

    return session.user.organizationId;
}

export async function getPaginatedDocumentHistory(documentId: string, limit: number, offset: number) {
    const organizationId = await getCurrentOrganizationId();
    const session = await auth();

    if (!session?.user?.id || !session?.user?.role) {
        throw new Error('Unauthorized: User ID or role not found in session.');
    }

    if (!container.isRegistered(InjectionTokens.DocumentHistoryRepository)) {
        container.register(InjectionTokens.DocumentHistoryRepository, {
            useFactory: () => new DrizzleDocumentHistoryRepository(db),
        });
    }

    const getDocumentHistoryUseCase = container.resolve(GetDocumentHistoryUseCase);
    return getDocumentHistoryUseCase.execute({ documentId, organizationId, limit, offset, userId: session.user.id, userRole: session.user.role });
}

/**
 * NOTA sobre Roles y Permisos Granulares:
 *
 * La función `getCurrentOrganizationId` se encarga de establecer el contexto de la organización
 * para la solicitud actual. La lógica de roles y permisos más granular (ej. "puede este usuario
 * editar documentos", "puede este usuario ver documentos de este tipo") DEBE implementarse
 * en la capa de aplicación (ej. dentro de `GetDocumentHistoryUseCase` o un `AuthorizationService`
 * que el caso de uso invocaría), utilizando el `organizationId` y el `userId` (o roles del usuario)
 * obtenidos de la sesión.
 */