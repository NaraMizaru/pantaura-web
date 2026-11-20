import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Droplets,
    Layers,
    MapPin,
    Share2,
    Smartphone,
    Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { DisasterMap } from '@/features/incidents/components/DisasterMap';
import { MediaGallery } from '@/features/incidents/components/MediaGallery';
import {
    IncidentStatusBadge,
    ModerationStatusBadge,
    ResolutionStatusBadge,
} from '@/features/incidents/components/StatusBadge';
import { EmptyState } from '@/features/incidents/components/UiStates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
    DisasterType,
    IncidentStatus,
    MediaItem,
    ModerationStatus,
    ResolutionStatus,
} from '@/types/pantaura';

type IncidentDetailProps = {
    incident: {
        id: string;
        title: string;
        disaster_type: DisasterType;
        disaster_type_label: string;
        urgent_needs?: string[];
        urgent_needs_labels?: string[];
        description: string;
        latitude: number;
        longitude: number;
        address: string | null;
        status: IncidentStatus;
        status_label: string;
        reports_count: number;
        confirmations_count?: number;
        verified_at: string | null;
        resolved_at: string | null;
        created_at: string | null;
        reports: Array<{
            id: string;
            description: string;
            latitude: number;
            longitude: number;
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

function formatDateTime(iso: string | null): string {
    if (!iso) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(iso));
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export default function PublicIncidentDetail({
    incident,
}: IncidentDetailProps) {
    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Tautan insiden disalin ke clipboard.');
        } catch {
            toast.error('Gagal menyalin tautan.');
        }
    };

    return (
        <>
            <Head title={incident.title} />
            <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
                {/* Sticky Glass Header */}
                <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8f9ff]/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#0284c7] focus-visible:outline-none"
                        >
                            <span className="flex size-8 items-center justify-center rounded-lg bg-[#006194] text-white">
                                <Droplets
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="text-base font-bold text-[#006194]">
                                Pantaura
                            </span>
                        </Link>

                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-slate-300 bg-white text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#0b1c30] dark:border-slate-300 dark:bg-white dark:text-[#0b1c30] dark:hover:bg-[#eff4ff] dark:hover:text-[#0b1c30]"
                        >
                            <Link href="/">
                                <ArrowLeft
                                    className="mr-1.5 size-4"
                                    aria-hidden="true"
                                />
                                Kembali ke Peta
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Operational Breadcrumb Strip */}
                <div className="border-b border-slate-200/70 bg-[#eff4ff]">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#3f4850]">
                            <Link href="/" className="hover:text-[#006194]">
                                Peta Pantauan
                            </Link>
                            <span aria-hidden="true">/</span>
                            <span className="font-semibold text-[#006194]">
                                Detail Insiden
                            </span>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleShare}
                            className="h-8 border-slate-300 bg-white text-xs text-[#0b1c30] hover:bg-[#dce9ff] hover:text-[#0b1c30] dark:border-slate-300 dark:bg-white dark:text-[#0b1c30] dark:hover:bg-[#dce9ff] dark:hover:text-[#0b1c30]"
                        >
                            <Share2
                                className="mr-1.5 size-3.5"
                                aria-hidden="true"
                            />
                            Bagikan Insiden
                        </Button>
                    </div>
                </div>

                <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
                    {/* Hero Incident Summary Card */}
                    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <IncidentStatusBadge status={incident.status} />
                                <span className="rounded-full bg-[#e5eeff] px-2.5 py-0.5 text-xs font-semibold text-[#004b73]">
                                    {incident.disaster_type_label}
                                </span>
                                <span className="rounded-full bg-[#e5eeff] px-2.5 py-0.5 text-xs font-semibold text-[#004b73]">
                                    {incident.reports_count} Laporan Warga
                                </span>
                                {(incident.confirmations_count ?? 0) > 0 && (
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                        ✓ Dikonfirmasi{' '}
                                        {incident.confirmations_count} warga
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-[#3f4850]">
                                Dilaporkan {formatDateTime(incident.created_at)}
                            </span>
                        </div>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0b1c30] sm:text-3xl">
                            {incident.title}
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-[#3f4850]">
                            {incident.description}
                        </p>

                        {incident.urgent_needs_labels &&
                            incident.urgent_needs_labels.length > 0 && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-[#3f4850]">
                                        Kebutuhan Mendesak:
                                    </span>
                                    {incident.urgent_needs_labels.map(
                                        (label) => (
                                            <span
                                                key={label}
                                                className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700"
                                            >
                                                {label}
                                            </span>
                                        ),
                                    )}
                                </div>
                            )}

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#3f4850]">
                            {incident.address && (
                                <span className="inline-flex items-center gap-1.5 font-medium text-[#0b1c30]">
                                    <MapPin
                                        className="size-4 text-[#006194]"
                                        aria-hidden="true"
                                    />
                                    {incident.address}
                                </span>
                            )}
                            <span className="font-mono text-[#006194]">
                                {incident.latitude.toFixed(5)},{' '}
                                {incident.longitude.toFixed(5)}
                            </span>
                        </div>

                        {/* Telemetry Strip */}
                        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <div className="rounded-lg bg-[#eff4ff] p-3.5">
                                <p className="text-[11px] font-bold tracking-wider text-[#3f4850] uppercase">
                                    Status Insiden
                                </p>
                                <p className="mt-1 text-sm font-bold text-[#0b1c30]">
                                    {incident.status_label}
                                </p>
                            </div>
                            <div className="rounded-lg bg-[#eff4ff] p-3.5">
                                <p className="text-[11px] font-bold tracking-wider text-[#3f4850] uppercase">
                                    Kontribusi Warga
                                </p>
                                <p className="mt-1 flex items-baseline gap-1 text-xl font-bold text-[#006194] tabular-nums">
                                    {incident.reports_count}
                                    <span className="text-xs font-medium text-[#3f4850]">
                                        laporan
                                    </span>
                                </p>
                            </div>
                            <div className="rounded-lg bg-[#eff4ff] p-3.5">
                                <p className="text-[11px] font-bold tracking-wider text-[#3f4850] uppercase">
                                    Terverifikasi
                                </p>
                                <p className="mt-1 text-xs font-semibold text-[#0b1c30]">
                                    {formatDateTime(incident.verified_at)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-[#eff4ff] p-3.5">
                                <p className="text-[11px] font-bold tracking-wider text-[#3f4850] uppercase">
                                    Selesai / Kondisi Pulih
                                </p>
                                <p className="mt-1 text-xs font-semibold text-[#0b1c30]">
                                    {formatDateTime(incident.resolved_at)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Two-Column Workspace */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* Left Column: Multi-Report Timeline & Resolutions */}
                        <div className="space-y-6 lg:col-span-7">
                            <div className="flex items-start gap-3 rounded-xl bg-[#cce5ff]/60 p-4 text-[#001d31]">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#006194] text-white">
                                    <Layers
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <p className="text-sm font-bold">
                                        Multiple Reports, One Incident
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-[#004b73]">
                                        Sistem mengelompokkan{' '}
                                        <strong>
                                            {incident.reports.length} laporan
                                            warga
                                        </strong>{' '}
                                        di lokasi yang sama ke dalam satu titik
                                        kejadian agar peta tetap akurat.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-[#cfe6f7] bg-[#eff4ff] px-4 py-3">
                                <Smartphone
                                    className="mt-0.5 size-4 shrink-0 text-[#006194]"
                                    aria-hidden="true"
                                />
                                <p className="text-xs text-[#3f4850]">
                                    <span className="font-semibold text-[#0b1c30]">
                                        Ingin ikut melapor?
                                    </span>{' '}
                                    Laporan tambahan dan bukti kondisi pulih
                                    dikirim melalui aplikasi mobile Pantaura.
                                    Web ini hanya untuk pemantauan publik.
                                </p>
                            </div>

                            {(() => {
                                const beforeImage = incident.reports
                                    .flatMap((r) => r.media)
                                    .find((m) => m.file_type === 'image');
                                const afterImage = incident.resolutions
                                    .flatMap((r) => r.media)
                                    .find((m) => m.file_type === 'image');

                                if (!beforeImage || !afterImage) {
                                    return null;
                                }

                                return (
                                    <Card className="border-emerald-200/80 bg-white shadow-xs">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-bold text-[#0b1c30]">
                                                Perbandingan Kondisi: Saat
                                                Kejadian vs Pemulihan (Before /
                                                After)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                                                    Saat Kejadian (Before)
                                                </span>
                                                <img
                                                    src={beforeImage.url}
                                                    alt="Foto kondisi saat kejadian"
                                                    className="aspect-video w-full rounded-lg border object-cover"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                    Kondisi Pemulihan (After)
                                                </span>
                                                <img
                                                    src={afterImage.url}
                                                    alt="Foto kondisi pemulihan"
                                                    className="aspect-video w-full rounded-lg border object-cover"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })()}

                            <section className="space-y-3">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0b1c30]">
                                    <Users
                                        className="size-5 text-[#006194]"
                                        aria-hidden="true"
                                    />
                                    Laporan &amp; Bukti Visual Warga (
                                    {incident.reports.length})
                                </h2>

                                {incident.reports.length === 0 ? (
                                    <EmptyState
                                        title="Belum ada laporan"
                                        description="Belum ada kontribusi laporan pada insiden ini."
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {incident.reports.map((report) => (
                                            <Card
                                                key={report.id}
                                                className="border-slate-200/80 bg-white shadow-xs"
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="flex size-8 items-center justify-center rounded-full bg-[#dae2fd] text-xs font-bold text-[#131b2e]">
                                                                {getInitials(
                                                                    report.reporter_name,
                                                                )}
                                                            </span>
                                                            <div>
                                                                <CardTitle className="text-sm font-semibold text-[#0b1c30]">
                                                                    {
                                                                        report.reporter_name
                                                                    }
                                                                </CardTitle>
                                                                <p className="flex items-center gap-1 text-xs text-[#3f4850]">
                                                                    <Calendar
                                                                        className="size-3"
                                                                        aria-hidden="true"
                                                                    />
                                                                    {formatDateTime(
                                                                        report.submitted_at,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ModerationStatusBadge
                                                            status={
                                                                report.moderation_status
                                                            }
                                                        />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <p className="text-sm text-[#0b1c30]">
                                                        {report.description}
                                                    </p>
                                                    <MediaGallery
                                                        media={report.media}
                                                    />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {incident.resolutions.length > 0 && (
                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-[#0b1c30]">
                                        Bukti Kondisi Selesai (
                                        {incident.resolutions.length})
                                    </h2>
                                    <div className="space-y-4">
                                        {incident.resolutions.map((res) => (
                                            <Card
                                                key={res.id}
                                                className="border-slate-200/80 bg-white shadow-xs"
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <CardTitle className="text-sm font-semibold text-[#0b1c30]">
                                                                {
                                                                    res.submitter_name
                                                                }
                                                            </CardTitle>
                                                            <p className="text-xs text-[#3f4850]">
                                                                {formatDateTime(
                                                                    res.created_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <ResolutionStatusBadge
                                                            status={res.status}
                                                        />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <p className="text-sm text-[#0b1c30]">
                                                        {res.description}
                                                    </p>
                                                    {res.rejection_reason && (
                                                        <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-800">
                                                            Alasan penolakan:{' '}
                                                            {
                                                                res.rejection_reason
                                                            }
                                                        </p>
                                                    )}
                                                    <MediaGallery
                                                        media={res.media}
                                                    />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Column: Embedded Map & Status History */}
                        <aside className="space-y-6 lg:col-span-5">
                            <Card className="overflow-hidden border-slate-200/80 bg-white shadow-xs">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-bold text-[#0b1c30]">
                                        Lokasi Kejadian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DisasterMap
                                        incidents={[
                                            {
                                                id: incident.id,
                                                title: incident.title,
                                                disaster_type:
                                                    incident.disaster_type,
                                                disaster_type_label:
                                                    incident.disaster_type_label,
                                                description:
                                                    incident.description,
                                                latitude: incident.latitude,
                                                longitude: incident.longitude,
                                                address: incident.address,
                                                status: incident.status,
                                                status_label:
                                                    incident.status_label,
                                                reports_count:
                                                    incident.reports_count,
                                                created_at: incident.created_at,
                                            },
                                        ]}
                                        selectedIncidentId={incident.id}
                                        zoom={15}
                                        className="h-[260px] w-full overflow-hidden rounded-lg border"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/80 bg-white shadow-xs">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-bold text-[#0b1c30]">
                                        Riwayat Status Insiden
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="divide-y divide-slate-100 p-0">
                                    {incident.status_histories.length === 0 ? (
                                        <p className="px-4 py-4 text-xs text-[#3f4850]">
                                            Belum ada riwayat perubahan status.
                                        </p>
                                    ) : (
                                        incident.status_histories.map(
                                            (history) => (
                                                <div
                                                    key={history.id}
                                                    className="flex flex-col gap-1 px-4 py-3 text-sm"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <IncidentStatusBadge
                                                            status={
                                                                history.new_status
                                                            }
                                                        />
                                                        <span className="text-xs text-[#707881]">
                                                            {formatDateTime(
                                                                history.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[#3f4850]">
                                                        oleh{' '}
                                                        {history.actor_name}
                                                    </p>
                                                    {history.reason && (
                                                        <p className="text-xs text-[#0b1c30]">
                                                            {history.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            ),
                                        )
                                    )}
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}
