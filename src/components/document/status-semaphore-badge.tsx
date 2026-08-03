import * as React from 'react';
import { getSemaphoreInfo } from '~/lib/deadline.utils';

interface StatusSemaphoreBadgeProps {
    startDate: Date | string | null | undefined;
}

export function StatusSemaphoreBadge({ startDate }: StatusSemaphoreBadgeProps) {
    const { label, badgeClass } = getSemaphoreInfo(startDate);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
            {label}
        </span>
    );
}
