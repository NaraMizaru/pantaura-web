import { Head, Link, router } from '@inertiajs/react';
import { IncidentStatusBadge } from '@/components/siagakita/status-badge';
import { EmptyState } from '@/components/siagakita/ui-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { IncidentStatus, PaginatedData } from '@/types/siagakita';

type IncidentRow = {
    id: string;
    title: string;
    address: string | null;
    status: IncidentStatus;
    reports_count: number;
    resolutions_count: number;
    created_at: string | null;
};

type IncidentsIndexProps = {
    incidents: PaginatedData<IncidentRow>;
    activeStatus: IncidentStatus | null;
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
}: IncidentsIndexProps) {
    const handleFilter = (key: IncidentStatus | 'all') => {
        router.get(
            '/admin/incidents',
            key === 'all' ? {} : { status: key },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Insiden Banjir" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Daftar Insiden Banjir
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola titik kejadian banjir beserta gabungan
                            laporan warga.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map((f) => {
                            const active =
                                (f.key === 'all' && activeStatus === null) ||
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

                {incidents.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada insiden"
                        description="Tidak ada insiden banjir yang sesuai dengan filter saat ini."
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
