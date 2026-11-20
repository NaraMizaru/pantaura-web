import type { IncidentStatus, StatusCounts } from '@/types/pantaura';

export const STATUS_FILTER_OPTIONS: Array<{
    key: keyof StatusCounts;
    label: string;
    dotColor?: string;
}> = [
    { key: 'all', label: 'Titik Aktif' },
    {
        key: 'unverified',
        label: 'Belum Diverifikasi',
        dotColor: 'bg-amber-500',
    },
    { key: 'verified', label: 'Terverifikasi', dotColor: 'bg-red-500' },
    {
        key: 'resolution_submitted',
        label: 'Pengajuan Selesai',
        dotColor: 'bg-indigo-500',
    },
    { key: 'resolved', label: 'Selesai', dotColor: 'bg-emerald-500' },
];

export const STATUS_STRIPE_COLOR: Record<IncidentStatus, string> = {
    unverified: 'bg-amber-500',
    verified: 'bg-red-500',
    resolution_submitted: 'bg-indigo-500',
    resolved: 'bg-emerald-500',
    rejected: 'bg-neutral-400',
};

export function formatIncidentDate(iso: string | null): string {
    if (!iso) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(iso));
}
