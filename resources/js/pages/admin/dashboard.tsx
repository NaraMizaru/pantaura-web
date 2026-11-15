import { Head, Link } from '@inertiajs/react';
import { DisasterMap } from '@/components/siagakita/disaster-map';
import { EmptyState } from '@/components/siagakita/ui-states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IncidentMarker } from '@/types/siagakita';

type DashboardProps = {
    stats: {
        active_incidents: number;
        pending_reports: number;
        pending_resolutions: number;
        resolved_incidents: number;
    };
    mapIncidents: IncidentMarker[];
    recentReports: Array<{
        id: string;
        description: string;
        reporter_name: string;
        incident_title: string | null;
        submitted_at: string;
    }>;
    recentResolutions: Array<{
        id: string;
        incident_id: string;
        incident_title: string;
        submitter_name: string;
        description: string;
        created_at: string | null;
    }>;
};

export default function AdminDashboard({
    stats,
    mapIncidents,
    recentReports,
    recentResolutions,
}: DashboardProps) {
    return (
        <>
            <Head title="Ringkasan Admin" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Ringkasan Operasional
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pantau laporan masuk, status insiden bencana, dan
                        pengajuan penyelesaian.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Insiden Aktif
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold tabular-nums">
                                {stats.active_incidents}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Laporan Menunggu Verifikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold tabular-nums">
                                {stats.pending_reports}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pengajuan Selesai
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold tabular-nums">
                                {stats.pending_resolutions}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Insiden Selesai
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold tabular-nums">
                                {stats.resolved_incidents}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base">
                            Peta Persebaran Insiden Bencana
                        </CardTitle>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/incidents">Kelola Insiden</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DisasterMap
                            incidents={mapIncidents}
                            detailBasePath="/admin/incidents"
                            className="h-[360px] w-full overflow-hidden rounded-lg border"
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Antrean Laporan Terbaru
                            </CardTitle>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin/reports">Lihat semua</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentReports.length === 0 ? (
                                <EmptyState
                                    title="Tidak ada antrean"
                                    description="Semua laporan warga sudah diperiksa."
                                />
                            ) : (
                                <div className="divide-y">
                                    {recentReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-sm font-medium">
                                                    {report.reporter_name}
                                                </p>
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    {report.description}
                                                </p>
                                            </div>
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                            >
                                                <Link
                                                    href={`/admin/reports/${report.id}`}
                                                >
                                                    Periksa
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Verifikasi Penyelesaian Terbaru
                            </CardTitle>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin/resolutions">
                                    Lihat semua
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentResolutions.length === 0 ? (
                                <EmptyState
                                    title="Tidak ada pengajuan"
                                    description="Belum ada bukti penyelesaian yang menunggu verifikasi."
                                />
                            ) : (
                                <div className="divide-y">
                                    {recentResolutions.map((res) => (
                                        <div
                                            key={res.id}
                                            className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-sm font-medium">
                                                    {res.incident_title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Oleh {res.submitter_name} —{' '}
                                                    {res.description}
                                                </p>
                                            </div>
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                            >
                                                <Link href="/admin/resolutions">
                                                    Tinjau
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
