import type { expedientes } from '@/db/schema';

export type Expediente = typeof expedientes.$inferSelect;

export type ExpedienteStatus = 'Abierto' | 'Cerrado' | 'Archivado';

export interface ExpedienteWithDocumentCount extends Expediente {
    documentCount: number;
}
