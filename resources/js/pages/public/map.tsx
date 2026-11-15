import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Droplets,
    Layers,
    MapPin,
    Search,
    ShieldCheck,
    Smartphone,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DisasterMap } from '@/components/siagakita/disaster-map';
import { IncidentStatusBadge } from '@/components/siagakita/status-badge';
import { EmptyState } from '@/components/siagakita/ui-states';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DISASTER_TYPE_LABELS, DISASTER_TYPE_OPTIONS } from '@/lib/disaster';
import type { Auth } from '@/types/auth';
import type {
    DisasterType,
    DisasterTypeCounts,
    IncidentMarker,
    IncidentStatus,
    StatusCounts,
} from '@/types/siagakita';

type PublicMapProps = {
    incidents: IncidentMarker[];
    activeStatus: IncidentStatus | null;
    activeType: DisasterType | null;
    statusCounts: StatusCounts;
    typeCounts: DisasterTypeCounts;
};

const FILTER_OPTIONS: Array<{
    key: keyof StatusCounts;
    label: string;
    dotColor?: string;
}> = [
    { key: 'all', label: 'Semua Titik' },
    {
        key: 'unverified',
        label: 'Belum Diverifikasi',
        dotColor: 'bg-amber-500',
    },
    { key: 'verified', label: 'Terverifikasi', dotColor: 'bg-red-500' },
    {
        key: 'resolution_submitted',
        label: 'Pengajuan Selesai',
        dotColor: 'bg-indigo-500',
    },
    { key: 'resolved', label: 'Selesai', dotColor: 'bg-emerald-500' },
];

const STATUS_STRIPE_COLOR: Record<IncidentStatus, string> = {
    unverified: 'bg-amber-500',
    verified: 'bg-red-500',
    resolution_submitted: 'bg-indigo-500',
    resolved: 'bg-emerald-500',
    rejected: 'bg-neutral-400',
};

function formatRelativeOrDate(iso: string | null): string {
    if (!iso) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(iso));
}

export default function PublicMap({
    incidents,
    activeStatus,
    activeType,
    statusCounts,
    typeCounts,
}: PublicMapProps) {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const [selectedId, setSelectedId] = useState<string | null>(
        incidents[0]?.id ?? null,
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'most_reports'>('newest');
    const [reportInfoOpen, setReportInfoOpen] = useState(false);

    const totalReportsCount = useMemo(
        () => incidents.reduce((sum, item) => sum + item.reports_count, 0),
        [incidents],
    );

    const filteredIncidents = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const list = q
            ? incidents.filter(
                  (item) =>
                      item.title.toLowerCase().includes(q) ||
                      (item.address?.toLowerCase().includes(q) ?? false) ||
                      item.description.toLowerCase().includes(q),
              )
            : incidents;

        if (sortBy === 'most_reports') {
            return [...list].sort((a, b) => b.reports_count - a.reports_count);
        }

        return list;
    }, [incidents, searchQuery, sortBy]);

    const handleFilter = (statusKey: keyof StatusCounts) => {
        const params: Record<string, string> = {};

        if (statusKey !== 'all') {
            params.status = statusKey;
        }

        if (activeType !== null) {
            params.type = activeType;
        }

        router.get('/', params, { preserveState: true, replace: true });
    };

    const handleTypeFilter = (type: DisasterType | 'all') => {
        const params: Record<string, string> = {};

        if (activeStatus !== null) {
            params.status = activeStatus;
        }

        if (type !== 'all') {
            params.type = type;
        }

        router.get('/', params, { preserveState: true, replace: true });
    };

    const focusOnMap = (id: string) => {
        setSelectedId(id);
        document
            .getElementById('peta-pantauan')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Head title="Peta Pemantauan Bencana Publik" />
            <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-[#0b1c30]">
                {/* Sticky Glass Header */}
                <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f8f9ff]/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#0284c7] focus-visible:outline-none"
                        >
                            <span className="flex size-9 items-center justify-center rounded-lg bg-[#006194] text-white shadow-xs">
                                <Droplets
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <div>
                                <span className="block text-base font-bold tracking-tight text-[#006194]">
                                    SiagaKita
                                </span>
                                <span className="hidden text-xs text-[#3f4850] sm:block">
                                    Pantauan Bencana &amp; Tanggap Darurat Publik
                                </span>
                            </div>
                        </Link>

                        <nav
                            aria-label="Navigasi utama"
                            className="hidden items-center gap-1 md:flex"
                        >
                            <a
                                href="#peta-pantauan"
                                className="rounded-lg bg-[#007bb9] px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
                            >
                                Peta Pantauan
                            </a>
                            <a
                                href="#daftar-kejadian"
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#3f4850] transition-colors hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                            >
                                Daftar Kejadian
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            {auth?.user?.role === 'admin' ? (
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-[#006194] text-white hover:bg-[#004b73]"
                                >
                                    <Link href="/admin">
                                        <ShieldCheck
                                            className="mr-1.5 size-4"
                                            aria-hidden="true"
                                        />
                                        Dashboard Admin
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300 bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
                                >
                                    <Link href="/login">Masuk Admin</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <section
                    aria-label="Informasi pelaporan warga"
                    className="border-b border-[#cfe6f7] bg-[#eff4ff]"
                >
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#006194] ring-1 ring-[#cfe6f7]">
                                <Smartphone
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#0b1c30]">
                                    Pelaporan warga dilakukan melalui aplikasi
                                    mobile SiagaKita
                                </p>
                                <p className="text-xs text-[#3f4850]">
                                    Web ini untuk pemantauan publik. Untuk
                                    melaporkan bencana, daftar atau masuk di
                                    aplikasi mobile lalu kirim lokasi dan bukti
                                    foto/video. Halaman login di sini khusus
                                    admin.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setReportInfoOpen(true)}
                            className="shrink-0 bg-[#006194] text-white hover:bg-[#004b73]"
                        >
                            Cara Melapor
                        </Button>
                    </div>
                </section>

                {/* Live Telemetry Summary Bar */}
                <section
                    aria-label="Ringkasan data kejadian bencana"
                    className="border-b border-slate-200/80 bg-white"
                >
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
                        <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-[#e5eeff] text-[#006194]">
                                    <Layers
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p className="text-lg leading-none font-bold tabular-nums">
                                        {statusCounts.all}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#3f4850]">
                                        Titik Insiden
                                    </p>
                                </div>
                            </div>

                            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                    <MapPin
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p className="text-lg leading-none font-bold text-red-700 tabular-nums">
                                        {statusCounts.verified}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#3f4850]">
                                        Terverifikasi
                                    </p>
                                </div>
                            </div>

                            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

                            <div className="flex items-center gap-2.5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                    <Droplets
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p className="text-lg leading-none font-bold text-amber-800 tabular-nums">
                                        {statusCounts.unverified}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#3f4850]">
                                        Menunggu Verifikasi
                                    </p>
                                </div>
                            </div>

                            <div className="hidden h-7 w-px bg-slate-200 md:block" />

                            <div className="hidden items-center gap-2.5 md:flex">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-[#eff4ff] text-[#00628d]">
                                    <Users
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p className="text-lg leading-none font-bold tabular-nums">
                                        {totalReportsCount}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#3f4850]">
                                        Laporan Warga
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-full bg-[#eff4ff] px-3 py-1 text-xs font-medium text-[#004b73]">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span>Data Terintegrasi Real-Time</span>
                        </div>
                    </div>
                </section>

                {/* Main Map Canvas + Floating Filter Pill Bar */}
                <section
                    id="peta-pantauan"
                    aria-labelledby="map-heading"
                    className="relative w-full bg-[#dce9ff]"
                >
                    <h1 id="map-heading" className="sr-only">
                        Peta Persebaran Insiden Bencana Publik
                    </h1>

                    {/* Floating Status Filter Bar */}
                    <div className="pointer-events-none absolute top-3 right-0 left-0 z-20 flex justify-center px-4">
                        <div
                            className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/60 bg-white/92 p-1.5 shadow-lg backdrop-blur-xl"
                            role="group"
                            aria-label="Filter status insiden"
                        >
                            {FILTER_OPTIONS.map((option) => {
                                const isActive =
                                    (option.key === 'all' &&
                                        activeStatus === null) ||
                                    option.key === activeStatus;
                                const count = statusCounts[option.key];

                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => handleFilter(option.key)}
                                        className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#0284c7] focus-visible:outline-none ${
                                            isActive
                                                ? 'bg-[#006194] text-white shadow-xs'
                                                : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                                        }`}
                                    >
                                        {option.dotColor && (
                                            <span
                                                className={`size-2 rounded-full ${option.dotColor}`}
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span>{option.label}</span>
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-[#e5eeff] text-[#004b73]'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <DisasterMap
                        incidents={filteredIncidents}
                        selectedIncidentId={selectedId}
                        className="h-[460px] w-full sm:h-[540px] lg:h-[580px]"
                    />

                    {/* Floating Legend Card */}
                    <div className="pointer-events-none absolute right-4 bottom-4 z-20 hidden md:block">
                        <div className="pointer-events-auto rounded-2xl border border-white/60 bg-white/92 p-3.5 shadow-lg backdrop-blur-md">
                            <p className="mb-2 text-[11px] font-bold tracking-wider text-[#0b1c30] uppercase">
                                Indikator Status
                            </p>
                            <ul className="space-y-1.5 text-xs text-[#3f4850]">
                                <li className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-red-600" />
                                    <span>Terverifikasi Aktif</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-amber-600" />
                                    <span>Belum Diverifikasi</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-blue-600" />
                                    <span>Pengajuan Selesai</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-emerald-600" />
                                    <span>Selesai / Kondisi Pulih</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Incident Directory & Search Section */}
                <main
                    id="daftar-kejadian"
                    className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-8 sm:px-6"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-[#0b1c30] sm:text-2xl">
                                Daftar Kejadian Bencana Terpantau
                            </h2>
                            <p className="text-sm text-[#3f4850]">
                                Menggabungkan beberapa laporan warga pada lokasi
                                yang sama menjadi satu insiden terpadu.
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-[#3f4850] tabular-nums">
                            Menampilkan {filteredIncidents.length} dari{' '}
                            {incidents.length} insiden
                        </span>
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex flex-col gap-3 rounded-xl bg-white p-3.5 shadow-xs sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#707881]"
                                aria-hidden="true"
                            />
                            <label htmlFor="incident-search" className="sr-only">
                                Cari lokasi atau judul insiden
                            </label>
                            <input
                                id="incident-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama jalan, alamat, atau deskripsi kejadian..."
                                className="min-h-[42px] w-full rounded-lg bg-[#eff4ff] pr-16 pl-9 text-sm text-[#0b1c30] placeholder:text-[#707881] focus:bg-[#e5eeff] focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-white px-2 py-0.5 text-xs font-medium text-[#3f4850] shadow-xs hover:text-[#0b1c30]"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="incident-type"
                                className="text-xs font-semibold whitespace-nowrap text-[#3f4850]"
                            >
                                Jenis:
                            </label>
                            <select
                                id="incident-type"
                                value={activeType ?? 'all'}
                                onChange={(e) =>
                                    handleTypeFilter(
                                        e.target.value as
                                            | DisasterType
                                            | 'all',
                                    )
                                }
                                className="min-h-[42px] rounded-lg bg-[#eff4ff] px-3 py-2 text-sm font-medium text-[#0b1c30] focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                            >
                                <option value="all">
                                    Semua Jenis ({typeCounts.all})
                                </option>
                                {DISASTER_TYPE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label} (
                                        {typeCounts[option.value]})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="incident-sort"
                                className="text-xs font-semibold whitespace-nowrap text-[#3f4850]"
                            >
                                Urutkan:
                            </label>
                            <select
                                id="incident-sort"
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value as
                                            | 'newest'
                                            | 'most_reports',
                                    )
                                }
                                className="min-h-[42px] rounded-lg bg-[#eff4ff] px-3 py-2 text-sm font-medium text-[#0b1c30] focus:ring-2 focus:ring-[#0284c7] focus:outline-none"
                            >
                                <option value="newest">Terbaru</option>
                                <option value="most_reports">
                                    Laporan Terbanyak
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Incident Cards Feed */}
                    {filteredIncidents.length === 0 ? (
                        <EmptyState
                            title="Tidak ada insiden ditemukan"
                            description="Coba ubah kata kunci pencarian atau pilih filter status/jenis lainnya."
                        />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {filteredIncidents.map((incident) => {
                                const isSelected = selectedId === incident.id;
                                return (
                                    <article
                                        key={incident.id}
                                        className={`relative overflow-hidden rounded-xl bg-white p-5 pl-6 shadow-xs transition-shadow hover:shadow-md ${
                                            isSelected
                                                ? 'ring-2 ring-[#0284c7]'
                                                : 'border border-slate-200/70'
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-0 bottom-0 left-0 w-1.5 ${STATUS_STRIPE_COLOR[incident.status]}`}
                                            aria-hidden="true"
                                        />

                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <IncidentStatusBadge
                                                    status={incident.status}
                                                />
                                                <span className="rounded-full bg-[#eff4ff] px-2.5 py-0.5 text-xs font-semibold text-[#004b73]">
                                                    {
                                                        DISASTER_TYPE_LABELS[
                                                            incident
                                                                .disaster_type
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                            <span className="rounded-full bg-[#eff4ff] px-2.5 py-0.5 text-xs font-semibold text-[#004b73] tabular-nums">
                                                {incident.reports_count} laporan
                                                warga
                                            </span>
                                        </div>

                                        <h3 className="mt-3 text-base font-bold text-[#0b1c30]">
                                            {incident.title}
                                        </h3>

                                        {incident.address && (
                                            <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-[#3f4850]">
                                                <MapPin
                                                    className="mt-0.5 size-3.5 shrink-0 text-[#006194]"
                                                    aria-hidden="true"
                                                />
                                                <span>{incident.address}</span>
                                            </p>
                                        )}

                                        <p className="mt-2 line-clamp-2 text-sm text-[#3f4850]">
                                            {incident.description}
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                            <span className="text-xs text-[#707881]">
                                                {formatRelativeOrDate(
                                                    incident.created_at,
                                                )}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        focusOnMap(incident.id)
                                                    }
                                                    className="min-h-[38px] border-slate-200 bg-[#eff4ff] text-[#004b73] hover:bg-[#dce9ff]"
                                                >
                                                    Fokus Peta
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="min-h-[38px] bg-[#006194] text-white hover:bg-[#004b73]"
                                                >
                                                    <Link
                                                        href={`/incidents/${incident.id}`}
                                                    >
                                                        Detail &amp; Bukti
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>

                <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-[#3f4850]">
                    SiagaKita — Platform Pelaporan &amp; Pemantauan Bencana
                    Berbasis Partisipasi Masyarakat
                </footer>

                <Dialog
                    open={reportInfoOpen}
                    onOpenChange={setReportInfoOpen}
                >
                    <DialogContent
                        showCloseButton={false}
                        className="bg-white text-[#0b1c30] shadow-xl ring-[#cfe6f7] sm:max-w-md"
                    >
                        <DialogHeader>
                            <DialogTitle>Cara melapor bencana</DialogTitle>
                            <DialogDescription className="text-[#3f4850]">
                                Pelaporan warga dilakukan melalui aplikasi
                                mobile SiagaKita. Web publik ini hanya untuk
                                memantau insiden, sedangkan login di sini khusus
                                admin.
                            </DialogDescription>
                        </DialogHeader>

                        <ol className="space-y-2.5 text-sm text-[#3f4850]">
                            <li className="flex gap-2.5">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                                    1
                                </span>
                                Buka aplikasi mobile SiagaKita di ponsel Anda.
                            </li>
                            <li className="flex gap-2.5">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                                    2
                                </span>
                                Daftar akun warga atau masuk dengan email dan
                                kata sandi Anda.
                            </li>
                            <li className="flex gap-2.5">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                                    3
                                </span>
                                Pilih buat laporan, tentukan jenis bencana dan
                                lokasi GPS kejadian.
                            </li>
                            <li className="flex gap-2.5">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                                    4
                                </span>
                                Lampirkan foto/video bukti, lalu kirim laporan.
                            </li>
                            <li className="flex gap-2.5">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-xs font-bold text-[#006194]">
                                    5
                                </span>
                                Pantau status verifikasi laporan di aplikasi
                                atau pada peta publik ini.
                            </li>
                        </ol>

                        <div className="rounded-lg bg-[#eff4ff] px-3 py-2.5 text-xs text-[#3f4850]">
                            Bukti bahwa kondisi sudah pulih juga diajukan
                            melalui aplikasi mobile, bukan dari halaman web ini.
                        </div>

                        <DialogFooter className="border-[#cfe6f7] bg-[#eff4ff]">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    className="bg-[#006194] text-white hover:bg-[#004b73]"
                                >
                                    Mengerti
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
