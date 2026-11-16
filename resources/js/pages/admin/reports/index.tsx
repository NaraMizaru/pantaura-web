import { Head, Link, router } from '@inertiajs/react';
import {
    IncidentStatusBadge,
    ModerationStatusBadge,
} from '@/features/incidents/components/StatusBadge';
import { EmptyState } from '@/features/incidents/components/UiStates';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type {
    DisasterType,
    IncidentStatus,
    ModerationStatus,
    PaginatedData,
} from '@/types/siagakita';

type ReportRow = {
    id: string;
    description: string;
    moderation_status: ModerationStatus;
    submitted_at: string;
    media_count: number;
    reporter: { id: string | null; name: string };
    incident: {
        id: string;
        title: string;
        disaster_type: DisasterType;
        disaster_type_label: string;
        status: IncidentStatus;
    } | null;
};

type ReportsIndexProps = {
    reports: PaginatedData<ReportRow>;
    activeStatus: ModerationStatus | null;
};

const STATUS_FILTERS: Array<{ key: ModerationStatus | 'all'; label: string }> =
    [
        { key: 'all', label: 'Semua' },
        { key: 'pending', label: 'Menunggu' },
        { key: 'verified', label: 'Terverifikasi' },
        { key: 'rejected', label: 'Ditolak' },
    ];

export default function AdminReportsIndex({
    reports,
    activeStatus,
}: ReportsIndexProps) {
    const handleFilter = (key: ModerationStatus | 'all') => {
        router.get(
            '/admin/reports',
            key === 'all' ? {} : { status: key },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Laporan Masuk" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Laporan Masuk
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Periksa bukti visual, verifikasi laporan, dan
                            kelompokkan ke insiden terdekat.
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

                {reports.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada laporan"
                        description="Belum ada laporan yang sesuai dengan filter status ini."
                    />
                ) : (
                    <Card>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Pelapor & Deskripsi
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Insiden Terkait
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Media
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {reports.data.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="max-w-md px-4 py-3">
                                                <p className="font-medium">
                                                    {report.reporter.name}
                                                </p>
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    {report.description}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {report.incident ? (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium">
                                                            {
                                                                report.incident
                                                                    .title
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                report.incident
                                                                    .disaster_type_label
                                                            }
                                                        </p>
                                                        <IncidentStatusBadge
                                                            status={
                                                                report.incident
                                                                    .status
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Belum dikelompokkan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ModerationStatusBadge
                                                    status={
                                                        report.moderation_status
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {report.media_count} file
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/reports/${report.id}`}
                                                    >
                                                        Periksa
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
