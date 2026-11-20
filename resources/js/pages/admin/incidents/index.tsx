import { Head, Link, router } from '@inertiajs/react';
import { IncidentStatusBadge } from '@/features/incidents/components/StatusBadge';
import { EmptyState } from '@/features/incidents/components/UiStates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DISASTER_TYPE_OPTIONS } from '@/features/incidents/lib/disaster';
import type {
    DisasterType,
    IncidentStatus,
    PaginatedData,
} from '@/types/pantaura';

type IncidentRow = {
    id: string;
    title: string;
    disaster_type: DisasterType;
    disaster_type_label: string;
    address: string | null;
    status: IncidentStatus;
    reports_count: number;
    resolutions_count: number;
    created_at: string | null;
};

type IncidentsIndexProps = {
    incidents: PaginatedData<IncidentRow>;
    activeStatus: IncidentStatus | null;
    activeType: DisasterType | null;
};

const STATUS_FILTERS: Array<{ key: IncidentStatus | 'all'; label: string }> = [
    { key: 'all', label: 'Semua' },
    { key: 'unverified', label: 'Belum Diverifikasi' },
    { key: 'verified', label: 'Terverifikasi' },
    { key: 'resolution_submitted', label: 'Pengajuan Selesai' },
    { key: 'resolved', label: 'Selesai' },
    { key: 'rejected', label: 'Ditolak' },
];

export default function AdminIncidentsIndex({
    incidents,
    activeStatus,
    activeType,
}: IncidentsIndexProps) {
    const buildParams = (
        status: IncidentStatus | 'all',
        type: DisasterType | 'all',
    ) => {
        const params: Record<string, string> = {};

        if (status !== 'all') {
            params.status = status;
        }

        if (type !== 'all') {
            params.type = type;
        }

        return params;
    };

    const handleFilter = (key: IncidentStatus | 'all') => {
        router.get('/admin/incidents', buildParams(key, activeType ?? 'all'), {
            preserveState: true,
            replace: true,
        });
    };

    const handleTypeFilter = (type: DisasterType | 'all') => {
        router.get(
            '/admin/incidents',
            buildParams(activeStatus ?? 'all', type),
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Insiden Bencana" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Daftar Insiden Bencana
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola titik kejadian bencana beserta gabungan
                            laporan warga.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <label
                            htmlFor="incident-type-filter"
                            className="text-xs font-semibold whitespace-nowrap text-muted-foreground"
                        >
                            Jenis:
                        </label>
                        <select
                            id="incident-type-filter"
                            value={activeType ?? 'all'}
                            onChange={(e) =>
                                handleTypeFilter(
                                    e.target.value as DisasterType | 'all',
                                )
                            }
                            className="min-h-[36px] rounded-md border bg-background px-2.5 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                            <option value="all">Semua Jenis</option>
                            {DISASTER_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <div className="flex flex-wrap gap-1.5">
                            {STATUS_FILTERS.map((f) => {
                                const active =
                                    (f.key === 'all' &&
                                        activeStatus === null) ||
                                    f.key === activeStatus;
                                return (
                                    <Button
                                        key={f.key}
                                        type="button"
                                        size="sm"
                                        variant={active ? 'default' : 'outline'}
                                        onClick={() => handleFilter(f.key)}
                                    >
                                        {f.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {incidents.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada insiden"
                        description="Tidak ada insiden bencana yang sesuai dengan filter saat ini."
                    />
                ) : (
                    <Card>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Insiden & Lokasi
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Laporan
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {incidents.data.map((incident) => (
                                        <tr
                                            key={incident.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">
                                                    {incident.title}
                                                </p>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {
                                                        incident.disaster_type_label
                                                    }
                                                </p>
                                                {incident.address && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {incident.address}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <IncidentStatusBadge
                                                    status={incident.status}
                                                />
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {incident.reports_count} laporan
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/incidents/${incident.id}`}
                                                    >
                                                        Detail
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
