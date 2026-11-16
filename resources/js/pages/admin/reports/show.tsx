import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Layers, X } from 'lucide-react';
import { useState } from 'react';
import { DisasterMap } from '@/features/incidents/components/DisasterMap';
import { MediaGallery } from '@/features/incidents/components/MediaGallery';
import {
    IncidentStatusBadge,
    ModerationStatusBadge,
} from '@/features/incidents/components/StatusBadge';
import { EmptyState } from '@/features/incidents/components/UiStates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type {
    DisasterType,
    IncidentStatus,
    MediaItem,
    ModerationStatus,
} from '@/types/siagakita';

type ReportShowProps = {
    report: {
        id: string;
        description: string;
        latitude: number;
        longitude: number;
        submitted_at: string;
        moderation_status: ModerationStatus;
        rejection_reason: string | null;
        reviewed_at: string | null;
        reporter: { id: string | null; name: string; email: string | null };
        reviewer_name: string | null;
        incident: {
            id: string;
            title: string;
            disaster_type: DisasterType;
            disaster_type_label: string;
            status: IncidentStatus;
        } | null;
        media: MediaItem[];
    };
    nearbyCandidates: Array<{
        id: string;
        title: string;
        disaster_type: DisasterType;
        disaster_type_label: string;
        address: string | null;
        status: IncidentStatus;
        reports_count: number;
        distance_meters: number;
    }>;
};

export default function AdminReportShow({
    report,
    nearbyCandidates,
}: ReportShowProps) {
    const [rejectOpen, setRejectOpen] = useState(false);
    const rejectForm = useForm({ reason: '' });

    const handleVerify = () => {
        router.post(`/admin/reports/${report.id}/verify`);
    };

    const handleGroup = (targetIncidentId: string) => {
        router.post(`/admin/reports/${report.id}/group`, {
            target_incident_id: targetIncidentId,
        });
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(`/admin/reports/${report.id}/reject`, {
            onSuccess: () => {
                setRejectOpen(false);
                rejectForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Detail Laporan" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/reports">
                            <ArrowLeft
                                className="mr-1.5 size-4"
                                aria-hidden="true"
                            />
                            Kembali ke Laporan
                        </Link>
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                        {report.moderation_status !== 'verified' && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleVerify}
                            >
                                <Check
                                    className="mr-1.5 size-4"
                                    aria-hidden="true"
                                />
                                Verifikasi Laporan
                            </Button>
                        )}
                        {report.moderation_status !== 'rejected' && (
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setRejectOpen(true)}
                            >
                                <X
                                    className="mr-1.5 size-4"
                                    aria-hidden="true"
                                />
                                Tolak Laporan
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-7">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {report.reporter.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {report.reporter.email ?? '-'} •{' '}
                                            {new Date(
                                                report.submitted_at,
                                            ).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <ModerationStatusBadge
                                        status={report.moderation_status}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm leading-relaxed">
                                    {report.description}
                                </p>

                                {report.rejection_reason && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        <strong>Alasan penolakan:</strong>{' '}
                                        {report.rejection_reason}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold">
                                        Bukti Visual
                                    </h3>
                                    <MediaGallery media={report.media} />
                                </div>
                            </CardContent>
                        </Card>

                        <DisasterMap
                            incidents={[
                                {
                                    id: report.incident?.id ?? report.id,
                                    title:
                                        report.incident?.title ??
                                        'Lokasi Laporan',
                                    disaster_type:
                                        report.incident?.disaster_type ??
                                        'flood',
                                    disaster_type_label:
                                        report.incident
                                            ?.disaster_type_label ?? 'Banjir',
                                    description: report.description,
                                    latitude: report.latitude,
                                    longitude: report.longitude,
                                    address: null,
                                    status:
                                        report.incident?.status ?? 'unverified',
                                    status_label: '',
                                    reports_count: 1,
                                    created_at: report.submitted_at,
                                },
                            ]}
                            zoom={15}
                            className="h-[280px] w-full overflow-hidden rounded-lg border"
                        />
                    </div>

                    <div className="space-y-6 lg:col-span-5">
                        {report.incident && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Insiden Saat Ini
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                                            {
                                                report.incident
                                                    .disaster_type_label
                                            }
                                        </span>
                                        <IncidentStatusBadge
                                            status={report.incident.status}
                                        />
                                    </div>
                                    <p className="font-semibold">
                                        {report.incident.title}
                                    </p>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Link
                                            href={`/admin/incidents/${report.incident.id}`}
                                        >
                                            Buka Detail Insiden
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Layers
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Rekomendasi Pengelompokan Insiden Terdekat
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {nearbyCandidates.length === 0 ? (
                                    <EmptyState
                                        title="Tidak ada kandidat terdekat"
                                        description="Tidak ditemukan insiden aktif dalam radius 1,5 km."
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        {nearbyCandidates.map((candidate) => (
                                            <div
                                                key={candidate.id}
                                                className="space-y-2 rounded-md border p-3"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <IncidentStatusBadge
                                                        status={
                                                            candidate.status
                                                        }
                                                    />
                                                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                                                        ~
                                                        {
                                                            candidate.distance_meters
                                                        }
                                                        m •{' '}
                                                        {
                                                            candidate.reports_count
                                                        }{' '}
                                                        laporan
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold">
                                                    {candidate.title}
                                                </p>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {
                                                        candidate.disaster_type_label
                                                    }
                                                </p>
                                                {candidate.address && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {candidate.address}
                                                    </p>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        handleGroup(
                                                            candidate.id,
                                                        )
                                                    }
                                                >
                                                    Gabungkan ke Insiden Ini
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Laporan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitReject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">
                                Alasan Penolakan
                            </Label>
                            <textarea
                                id="reject-reason"
                                required
                                minLength={5}
                                rows={3}
                                value={rejectForm.data.reason}
                                onChange={(e) =>
                                    rejectForm.setData('reason', e.target.value)
                                }
                                placeholder="Contoh: Bukti foto tidak menunjukkan kondisi bencana atau lokasi tidak sesuai."
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            />
                            {rejectForm.errors.reason && (
                                <p className="text-xs text-destructive">
                                    {rejectForm.errors.reason}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={rejectForm.processing}
                            >
                                Konfirmasi Tolak
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
