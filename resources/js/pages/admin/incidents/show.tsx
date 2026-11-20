import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useState } from 'react';
import { DisasterMap } from '@/features/incidents/components/DisasterMap';
import { MediaGallery } from '@/features/incidents/components/MediaGallery';
import {
    IncidentStatusBadge,
    ModerationStatusBadge,
    ResolutionStatusBadge,
} from '@/features/incidents/components/StatusBadge';
import { URGENT_NEED_OPTIONS } from '@/features/incidents/lib/disaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
    DisasterType,
    IncidentStatus,
    MediaItem,
    ModerationStatus,
    ResolutionStatus,
    UrgentNeed,
} from '@/types/pantaura';

type AdminIncidentShowProps = {
    incident: {
        id: string;
        title: string;
        disaster_type: DisasterType;
        disaster_type_label: string;
        urgent_needs?: UrgentNeed[];
        confirmations_count?: number;
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
    const [selectedNeeds, setSelectedNeeds] = useState<UrgentNeed[]>(
        incident.urgent_needs ?? [],
    );
    const [savingNeeds, setSavingNeeds] = useState(false);

    const toggleNeed = (need: UrgentNeed) => {
        setSelectedNeeds((prev) =>
            prev.includes(need)
                ? prev.filter((item) => item !== need)
                : [...prev, need],
        );
    };

    const saveNeeds = () => {
        setSavingNeeds(true);
        router.patch(
            `/admin/incidents/${incident.id}/needs`,
            { urgent_needs: selectedNeeds },
            {
                preserveScroll: true,
                onFinish: () => setSavingNeeds(false),
            },
        );
    };
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
                            disaster_type_label: incident.disaster_type_label,
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

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <CardTitle className="text-base">
                                Kebutuhan Mendesak &amp; Konfirmasi Warga
                            </CardTitle>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                {incident.confirmations_count ?? 0} konfirmasi
                                warga
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {URGENT_NEED_OPTIONS.map((option) => {
                                const active = selectedNeeds.includes(
                                    option.value,
                                );
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleNeed(option.value)}
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                            active
                                                ? 'border-rose-600 bg-rose-600 text-white'
                                                : 'border-border bg-background text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            disabled={savingNeeds}
                            onClick={saveNeeds}
                        >
                            {savingNeeds
                                ? 'Menyimpan...'
                                : 'Simpan Kebutuhan Mendesak'}
                        </Button>
                    </CardContent>
                </Card>

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
