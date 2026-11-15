import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { DisasterMap } from '@/components/siagakita/disaster-map';
import { MediaGallery } from '@/components/siagakita/media-gallery';
import {
    IncidentStatusBadge,
    ModerationStatusBadge,
    ResolutionStatusBadge,
} from '@/components/siagakita/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
    DisasterType,
    IncidentStatus,
    MediaItem,
    ModerationStatus,
    ResolutionStatus,
} from '@/types/siagakita';

type AdminIncidentShowProps = {
    incident: {
        id: string;
        title: string;
        disaster_type: DisasterType;
        disaster_type_label: string;
        description: string;
        latitude: number;
        longitude: number;
        address: string | null;
        status: IncidentStatus;
        verifier_name: string | null;
        verified_at: string | null;
        resolved_at: string | null;
        created_at: string | null;
        reports: Array<{
            id: string;
            description: string;
            moderation_status: ModerationStatus;
            submitted_at: string;
            reporter_name: string;
            media: MediaItem[];
        }>;
        resolutions: Array<{
            id: string;
            description: string;
            status: ResolutionStatus;
            rejection_reason: string | null;
            created_at: string | null;
            submitter_name: string;
            media: MediaItem[];
        }>;
        status_histories: Array<{
            id: string;
            previous_status: IncidentStatus | null;
            new_status: IncidentStatus;
            reason: string | null;
            actor_name: string;
            created_at: string | null;
        }>;
    };
};

export default function AdminIncidentShow({
    incident,
}: AdminIncidentShowProps) {
    return (
        <>
            <Head title={incident.title} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/incidents">
                            <ArrowLeft
                                className="mr-1.5 size-4"
                                aria-hidden="true"
                            />
                            Kembali ke Insiden
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                            {incident.disaster_type_label}
                        </span>
                        <IncidentStatusBadge status={incident.status} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {incident.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {incident.description}
                    </p>
                    {incident.address && (
                        <p className="flex items-center gap-1.5 text-sm">
                            <MapPin
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            {incident.address}
                        </p>
                    )}
                </div>

                <DisasterMap
                    incidents={[
                        {
                            id: incident.id,
                            title: incident.title,
                            disaster_type: incident.disaster_type,
                            disaster_type_label:
                                incident.disaster_type_label,
                            description: incident.description,
                            latitude: incident.latitude,
                            longitude: incident.longitude,
                            address: incident.address,
                            status: incident.status,
                            status_label: '',
                            reports_count: incident.reports.length,
                            created_at: incident.created_at,
                        },
                    ]}
                    zoom={15}
                    className="h-[260px] w-full overflow-hidden rounded-lg border"
                />

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">
                        Laporan Tergabung ({incident.reports.length})
                    </h2>
                    <div className="space-y-3">
                        {incident.reports.map((report) => (
                            <Card key={report.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-sm">
                                                {report.reporter_name}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    report.submitted_at,
                                                ).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ModerationStatusBadge
                                                status={
                                                    report.moderation_status
                                                }
                                            />
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={`/admin/reports/${report.id}`}
                                                >
                                                    Kelola
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm">
                                        {report.description}
                                    </p>
                                    <MediaGallery media={report.media} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {incident.resolutions.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">
                            Riwayat Pengajuan Penyelesaian
                        </h2>
                        <div className="space-y-3">
                            {incident.resolutions.map((res) => (
                                <Card key={res.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle className="text-sm">
                                                {res.submitter_name}
                                            </CardTitle>
                                            <ResolutionStatusBadge
                                                status={res.status}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm">
                                            {res.description}
                                        </p>
                                        {res.rejection_reason && (
                                            <p className="text-xs text-destructive">
                                                Alasan ditolak:{' '}
                                                {res.rejection_reason}
                                            </p>
                                        )}
                                        <MediaGallery media={res.media} />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">
                        Audit Log Perubahan Status
                    </h2>
                    <Card>
                        <CardContent className="divide-y p-0">
                            {incident.status_histories.map((h) => (
                                <div
                                    key={h.id}
                                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <IncidentStatusBadge
                                                status={h.new_status}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                oleh {h.actor_name}
                                            </span>
                                        </div>
                                        {h.reason && (
                                            <p className="text-xs text-muted-foreground">
                                                {h.reason}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {h.created_at
                                            ? new Date(
                                                  h.created_at,
                                              ).toLocaleString('id-ID')
                                            : '-'}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}
