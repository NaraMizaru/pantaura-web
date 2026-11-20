import { Droplets, Layers, MapPin, Users } from 'lucide-react';
import type { StatusCounts } from '@/types/pantaura';

export function TelemetrySummaryBar({
    statusCounts,
    totalReportsCount,
}: {
    statusCounts: StatusCounts;
    totalReportsCount: number;
}) {
    return (
        <section
            aria-label="Ringkasan data kejadian bencana"
            className="border-b border-slate-200/80 bg-white"
        >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#e5eeff] text-[#006194]">
                            <Layers className="size-4" aria-hidden="true" />
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
                            <MapPin className="size-4" aria-hidden="true" />
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
                            <Droplets className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-lg leading-none font-bold text-amber-800 tabular-nums">
                                {statusCounts.unverified}
                            </p>
                            <p className="mt-0.5 text-xs text-[#3f4850]">
                                Belum Diverifikasi
                            </p>
                        </div>
                    </div>

                    <div className="hidden h-7 w-px bg-slate-200 md:block" />

                    <div className="hidden items-center gap-2.5 md:flex">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#eff4ff] text-[#00628d]">
                            <Users className="size-4" aria-hidden="true" />
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
    );
}
