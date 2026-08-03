export type SemaphoreLevel = 'NORMAL' | 'WARNING' | 'OVERDUE';

export interface SemaphoreInfo {
    daysElapsed: number;
    level: SemaphoreLevel;
    label: string;
    badgeClass: string;
}

export function getSemaphoreInfo(startDate: Date | string | null | undefined): SemaphoreInfo {
    if (!startDate) {
        return {
            daysElapsed: 0,
            level: 'NORMAL',
            label: '0 días',
            badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        };
    }

    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - start.getTime());
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (daysElapsed >= 5) {
        return {
            daysElapsed,
            level: 'OVERDUE',
            label: `${daysElapsed} días (Vencido)`,
            badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 font-bold',
        };
    }

    if (daysElapsed >= 3) {
        return {
            daysElapsed,
            level: 'WARNING',
            label: `${daysElapsed} días (Atención)`,
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        };
    }

    return {
        daysElapsed,
        level: 'NORMAL',
        label: `${daysElapsed} días`,
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    };
}
