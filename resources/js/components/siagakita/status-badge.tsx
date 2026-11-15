import { Badge } from '@/components/ui/badge';
import type {
    IncidentStatus,
    ModerationStatus,
    ResolutionStatus,
} from '@/types/siagakita';

const INCIDENT_STATUS_META: Record<
    IncidentStatus,
    { label: string; className: string }
> = {
    unverified: {
        label: 'Belum Diverifikasi',
        className:
            'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200',
    },
    verified: {
        label: 'Terverifikasi',
        className:
            'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200',
    },
    resolution_submitted: {
        label: 'Pengajuan Selesai',
        className:
            'border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200',
    },
    resolved: {
        label: 'Selesai',
        className:
            'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    },
    rejected: {
        label: 'Ditolak',
        className:
            'border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    },
};

const MODERATION_STATUS_META: Record<
    ModerationStatus,
    { label: string; className: string }
> = {
    pending: {
        label: 'Menunggu',
        className:
            'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200',
    },
    verified: {
        label: 'Terverifikasi',
        className:
            'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    },
    rejected: {
        label: 'Ditolak',
        className:
            'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200',
    },
};

const RESOLUTION_STATUS_META: Record<
    ResolutionStatus,
    { label: string; className: string }
> = {
    pending: {
        label: 'Menunggu Pemeriksaan',
        className:
            'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200',
    },
    approved: {
        label: 'Disetujui',
        className:
            'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
    },
    rejected: {
        label: 'Ditolak',
        className:
            'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200',
    },
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
    const meta = INCIDENT_STATUS_META[status];

    return (
        <Badge variant="outline" className={meta.className}>
            {meta.label}
        </Badge>
    );
}

export function ModerationStatusBadge({
    status,
}: {
    status: ModerationStatus;
}) {
    const meta = MODERATION_STATUS_META[status];

    return (
        <Badge variant="outline" className={meta.className}>
            {meta.label}
        </Badge>
    );
}

export function ResolutionStatusBadge({
    status,
}: {
    status: ResolutionStatus;
}) {
    const meta = RESOLUTION_STATUS_META[status];

    return (
        <Badge variant="outline" className={meta.className}>
            {meta.label}
        </Badge>
    );
}
