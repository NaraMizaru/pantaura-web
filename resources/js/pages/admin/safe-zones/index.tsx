import { Head, router, useForm } from '@inertiajs/react';
import { ShieldPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SAFE_ZONE_TYPE_OPTIONS } from '@/features/incidents/lib/disaster';
import { SafeZonePickerMap } from '@/features/admin/components/SafeZonePickerMap';
import { EmptyState } from '@/features/incidents/components/UiStates';
import type { SafeZoneMarker, SafeZoneType } from '@/types/pantaura';

export default function AdminSafeZonesIndex({
    safeZones,
}: {
    safeZones: SafeZoneMarker[];
}) {
    const form = useForm<{
        name: string;
        type: SafeZoneType;
        description: string;
        latitude: string;
        longitude: string;
        address: string;
        capacity: string;
    }>({
        name: '',
        type: 'posko',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        capacity: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/safe-zones', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const toggleActive = (zone: SafeZoneMarker) => {
        router.patch(
            `/admin/safe-zones/${zone.id}`,
            { is_active: !zone.is_active },
            { preserveScroll: true },
        );
    };

    const destroyZone = (zone: SafeZoneMarker) => {
        router.delete(`/admin/safe-zones/${zone.id}`, {
            preserveScroll: true,
        });
    };

    const parsedLat = Number.parseFloat(form.data.latitude);
    const parsedLng = Number.parseFloat(form.data.longitude);
    const pickedLatitude = Number.isFinite(parsedLat) ? parsedLat : null;
    const pickedLongitude = Number.isFinite(parsedLng) ? parsedLng : null;

    const handlePickCoordinates = (lat: number, lng: number) => {
        form.setData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        }));
    };

    return (
        <>
            <Head title="Posko & Titik Aman" />
            <div className="space-y-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Posko &amp; Titik Aman
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola lokasi posko evakuasi, pos kesehatan, dan titik
                        aman yang tampil pada peta publik Pantaura.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldPlus className="size-4" aria-hidden="true" />
                            Tambah Posko / Titik Aman Baru
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Klik langsung titik lokasi pada peta di bawah untuk
                            mengisi Latitude &amp; Longitude secara otomatis.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SafeZonePickerMap
                            safeZones={safeZones}
                            pickedLatitude={pickedLatitude}
                            pickedLongitude={pickedLongitude}
                            onPickCoordinates={handlePickCoordinates}
                        />
                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 sm:grid-cols-2"
                        >
                            <div className="space-y-1">
                                <label
                                    htmlFor="zone-name"
                                    className="text-xs font-medium"
                                >
                                    Nama Lokasi
                                </label>
                                <input
                                    id="zone-name"
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="Posko Siaga Kelurahan..."
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="zone-type"
                                    className="text-xs font-medium"
                                >
                                    Jenis Titik Aman
                                </label>
                                <select
                                    id="zone-type"
                                    value={form.data.type}
                                    onChange={(e) =>
                                        form.setData(
                                            'type',
                                            e.target.value as SafeZoneType,
                                        )
                                    }
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                >
                                    {SAFE_ZONE_TYPE_OPTIONS.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="zone-lat"
                                    className="text-xs font-medium"
                                >
                                    Latitude
                                </label>
                                <input
                                    id="zone-lat"
                                    type="number"
                                    step="any"
                                    required
                                    value={form.data.latitude}
                                    onChange={(e) =>
                                        form.setData('latitude', e.target.value)
                                    }
                                    placeholder="-6.2088"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="zone-lng"
                                    className="text-xs font-medium"
                                >
                                    Longitude
                                </label>
                                <input
                                    id="zone-lng"
                                    type="number"
                                    step="any"
                                    required
                                    value={form.data.longitude}
                                    onChange={(e) =>
                                        form.setData(
                                            'longitude',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="106.8456"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="zone-address"
                                    className="text-xs font-medium"
                                >
                                    Alamat
                                </label>
                                <input
                                    id="zone-address"
                                    type="text"
                                    value={form.data.address}
                                    onChange={(e) =>
                                        form.setData('address', e.target.value)
                                    }
                                    placeholder="Jl. Jatinegara Barat..."
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="zone-capacity"
                                    className="text-xs font-medium"
                                >
                                    Kapasitas (Orang)
                                </label>
                                <input
                                    id="zone-capacity"
                                    type="number"
                                    min={1}
                                    value={form.data.capacity}
                                    onChange={(e) =>
                                        form.setData('capacity', e.target.value)
                                    }
                                    placeholder="200"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label
                                    htmlFor="zone-description"
                                    className="text-xs font-medium"
                                >
                                    Keterangan Tambahan
                                </label>
                                <input
                                    id="zone-description"
                                    type="text"
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Tenda pengungsian, dapur umum, layanan medis..."
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : 'Tambah Titik Aman'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {safeZones.length === 0 ? (
                    <EmptyState
                        title="Belum ada Posko / Titik Aman"
                        description="Tambahkan lokasi posko atau titik evakuasi melalui formulir di atas."
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {safeZones.map((zone) => (
                            <Card key={zone.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                                                {zone.type_label}
                                            </span>
                                            <CardTitle className="mt-1.5 text-base">
                                                {zone.name}
                                            </CardTitle>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                zone.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-neutral-100 text-neutral-600'
                                            }`}
                                        >
                                            {zone.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    {zone.address && (
                                        <p className="text-muted-foreground">
                                            {zone.address}
                                        </p>
                                    )}
                                    {zone.description && (
                                        <p>{zone.description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                                        <span>
                                            {zone.latitude.toFixed(5)},{' '}
                                            {zone.longitude.toFixed(5)}
                                            {zone.capacity
                                                ? ` • Kapasitas ${zone.capacity}`
                                                : ''}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    toggleActive(zone)
                                                }
                                            >
                                                {zone.is_active
                                                    ? 'Nonaktifkan'
                                                    : 'Aktifkan'}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    destroyZone(zone)
                                                }
                                            >
                                                <Trash2
                                                    className="size-3.5"
                                                    aria-hidden="true"
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
