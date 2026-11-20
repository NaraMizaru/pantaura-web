import { Head, router, usePage } from '@inertiajs/react';
import { Search, ShieldPlus, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DisasterMap } from '@/features/incidents/components/DisasterMap';
import { EmptyState } from '@/features/incidents/components/UiStates';
import { DISASTER_TYPE_OPTIONS } from '@/features/incidents/lib/disaster';
import { IncidentCard } from '@/features/public-map/components/IncidentCard';
import { PublicHeader } from '@/features/public-map/components/PublicHeader';
import { ReportInfoDialog } from '@/features/public-map/components/ReportInfoDialog';
import { StatusFilterBar } from '@/features/public-map/components/StatusFilterBar';
import { TelemetrySummaryBar } from '@/features/public-map/components/TelemetrySummaryBar';
import type { Auth } from '@/types/auth';
import type {
    DisasterType,
    DisasterTypeCounts,
    IncidentMarker,
    IncidentStatus,
    SafeZoneMarker,
    StatusCounts,
} from '@/types/pantaura';

type PublicMapProps = {
    incidents: IncidentMarker[];
    safeZones?: SafeZoneMarker[];
    activeStatus: IncidentStatus | null;
    activeType: DisasterType | null;
    statusCounts: StatusCounts;
    typeCounts: DisasterTypeCounts;
};

export default function PublicMap({
    incidents,
    safeZones = [],
    activeStatus,
    activeType,
    statusCounts,
    typeCounts,
}: PublicMapProps) {
    const { auth } = usePage<{ auth?: Auth }>().props;
    const [selectedId, setSelectedId] = useState<string | null>(
        incidents[0]?.id ?? null,
    );
    const [focusTrigger, setFocusTrigger] = useState(0);
    const [showSafeZones, setShowSafeZones] = useState(true);
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
        setFocusTrigger((prev) => prev + 1);
        document
            .getElementById('peta-pantauan')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Head title="Peta Pemantauan Bencana Publik" />
            <div className="flex min-h-screen flex-col bg-[#f8f9ff] text-[#0b1c30]">
                <PublicHeader auth={auth} />

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
                                    mobile Pantaura
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

                <TelemetrySummaryBar
                    statusCounts={statusCounts}
                    totalReportsCount={totalReportsCount}
                />

                {/* Main Map Canvas + Floating Filter Bar */}
                <section
                    id="peta-pantauan"
                    aria-labelledby="map-heading"
                    className="relative w-full bg-[#dce9ff]"
                >
                    <h1 id="map-heading" className="sr-only">
                        Peta Persebaran Insiden Bencana Publik
                    </h1>

                    <StatusFilterBar
                        activeStatus={activeStatus}
                        statusCounts={statusCounts}
                        onSelectStatus={handleFilter}
                    />

                    <DisasterMap
                        incidents={filteredIncidents}
                        safeZones={safeZones}
                        showSafeZones={showSafeZones}
                        selectedIncidentId={selectedId}
                        focusTrigger={focusTrigger}
                        className="h-[460px] w-full sm:h-[540px] lg:h-[580px]"
                    />

                    {/* Safe Zone Layer Toggle */}
                    <div className="pointer-events-none absolute bottom-4 left-4 z-20">
                        <button
                            type="button"
                            onClick={() => setShowSafeZones((prev) => !prev)}
                            className={`pointer-events-auto inline-flex min-h-[38px] items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md transition-colors ${
                                showSafeZones
                                    ? 'border-teal-600 bg-teal-700 text-white hover:bg-teal-800'
                                    : 'border-white/70 bg-white/95 text-[#0b1c30] hover:bg-[#eff4ff]'
                            }`}
                        >
                            <ShieldPlus
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            <span>
                                Posko &amp; Titik Aman ({safeZones.length})
                            </span>
                        </button>
                    </div>

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
                            <label
                                htmlFor="incident-search"
                                className="sr-only"
                            >
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
                                        e.target.value as DisasterType | 'all',
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
                            {filteredIncidents.map((incident) => (
                                <IncidentCard
                                    key={incident.id}
                                    incident={incident}
                                    isSelected={selectedId === incident.id}
                                    onFocusMap={focusOnMap}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-[#3f4850]">
                    Pantaura — Platform Pelaporan &amp; Pemantauan Bencana
                    Berbasis Partisipasi Masyarakat
                </footer>

                <ReportInfoDialog
                    open={reportInfoOpen}
                    onOpenChange={setReportInfoOpen}
                />
            </div>
        </>
    );
}
