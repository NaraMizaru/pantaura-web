import { Head, Link, router, useForm } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { MediaGallery } from '@/features/incidents/components/MediaGallery';
import {
    IncidentStatusBadge,
    ResolutionStatusBadge,
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
    IncidentStatus,
    MediaItem,
    PaginatedData,
    ResolutionStatus,
} from '@/types/pantaura';

type ResolutionRow = {
    id: string;
    description: string;
    status: ResolutionStatus;
    rejection_reason: string | null;
    created_at: string | null;
    submitter_name: string;
    incident: {
        id: string;
        title: string;
        address: string | null;
        status: IncidentStatus;
    };
    media: MediaItem[];
};

type ResolutionsIndexProps = {
    resolutions: PaginatedData<ResolutionRow>;
    activeStatus: ResolutionStatus | null;
};

const FILTERS: Array<{ key: ResolutionStatus | 'all'; label: string }> = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'rejected', label: 'Ditolak' },
];

export default function AdminResolutionsIndex({
    resolutions,
    activeStatus,
}: ResolutionsIndexProps) {
    const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
    const rejectForm = useForm({ reason: '' });

    const handleFilter = (key: ResolutionStatus | 'all') => {
        router.get('/admin/resolutions', key === 'all' ? {} : { status: key }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleApprove = (id: string) => {
        router.post(`/admin/resolutions/${id}/approve`);
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectTargetId) {
            return;
        }
        rejectForm.post(`/admin/resolutions/${rejectTargetId}/reject`, {
            onSuccess: () => {
                setRejectTargetId(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Verifikasi Penyelesaian" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Verifikasi Penyelesaian Bencana
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Periksa bukti foto atau video terbaru sebelum
                            menyatakan insiden selesai.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {FILTERS.map((f) => {
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

                {resolutions.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada pengajuan penyelesaian"
                        description="Tidak ada pengajuan bukti kondisi selesai yang sesuai filter."
                    />
                ) : (
                    <div className="space-y-4">
                        {resolutions.data.map((res) => (
                            <Card key={res.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <ResolutionStatusBadge
                                                    status={res.status}
                                                />
                                                <IncidentStatusBadge
                                                    status={res.incident.status}
                                                />
                                            </div>
                                            <CardTitle className="text-base">
                                                <Link
                                                    href={`/admin/incidents/${res.incident.id}`}
                                                    className="hover:underline"
                                                >
                                                    {res.incident.title}
                                                </Link>
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                Diajukan oleh{' '}
                                                {res.submitter_name}
                                            </p>
                                        </div>

                                        {res.status === 'pending' && (
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleApprove(res.id)
                                                    }
                                                >
                                                    <Check
                                                        className="mr-1.5 size-4"
                                                        aria-hidden="true"
                                                    />
                                                    Setujui Selesai
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setRejectTargetId(
                                                            res.id,
                                                        )
                                                    }
                                                >
                                                    <X
                                                        className="mr-1.5 size-4"
                                                        aria-hidden="true"
                                                    />
                                                    Tolak
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm">{res.description}</p>
                                    {res.rejection_reason && (
                                        <p className="rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                            Alasan penolakan:{' '}
                                            {res.rejection_reason}
                                        </p>
                                    )}
                                    <MediaGallery media={res.media} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={rejectTargetId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectTargetId(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Bukti Penyelesaian</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitReject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="resolution-reject-reason">
                                Alasan Penolakan
                            </Label>
                            <textarea
                                id="resolution-reject-reason"
                                required
                                minLength={5}
                                rows={3}
                                value={rejectForm.data.reason}
                                onChange={(e) =>
                                    rejectForm.setData('reason', e.target.value)
                                }
                                placeholder="Contoh: Genangan air masih terlihat tinggi di sekitar lokasi."
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
                                onClick={() => setRejectTargetId(null)}
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
