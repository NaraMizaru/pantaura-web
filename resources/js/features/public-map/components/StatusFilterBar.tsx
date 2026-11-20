import { ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';
import { STATUS_FILTER_OPTIONS } from '@/features/public-map/constants';
import type { IncidentStatus, StatusCounts } from '@/types/pantaura';

export function StatusFilterBar({
    activeStatus,
    statusCounts,
    onSelectStatus,
}: {
    activeStatus: IncidentStatus | null;
    statusCounts: StatusCounts;
    onSelectStatus: (statusKey: keyof StatusCounts) => void;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const activeOption =
        STATUS_FILTER_OPTIONS.find(
            (opt) =>
                (opt.key === 'all' && activeStatus === null) ||
                opt.key === activeStatus,
        ) ?? STATUS_FILTER_OPTIONS[0];

    const handleSelect = (statusKey: keyof StatusCounts) => {
        setMobileMenuOpen(false);
        onSelectStatus(statusKey);
    };

    return (
        <div className="pointer-events-none absolute top-3 right-0 left-0 z-20 flex justify-center px-4">
            {/* Mobile: Collapsible Filter Menu */}
            <div className="pointer-events-auto relative md:hidden">
                <button
                    type="button"
                    aria-expanded={mobileMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-white/60 bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#0b1c30] shadow-lg backdrop-blur-xl transition-colors hover:bg-[#eff4ff] focus-visible:ring-2 focus-visible:ring-[#0284c7] focus-visible:outline-none"
                >
                    <Filter
                        className="size-3.5 text-[#006194]"
                        aria-hidden="true"
                    />
                    {activeOption.dotColor && (
                        <span
                            className={`size-2 rounded-full ${activeOption.dotColor}`}
                            aria-hidden="true"
                        />
                    )}
                    <span>{activeOption.label}</span>
                    <span className="rounded-full bg-[#e5eeff] px-1.5 py-0.5 text-[11px] font-bold text-[#004b73] tabular-nums">
                        {statusCounts[activeOption.key]}
                    </span>
                    <ChevronDown
                        className={`size-3.5 text-[#3f4850] transition-transform ${
                            mobileMenuOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                    />
                </button>

                {mobileMenuOpen && (
                    <div
                        role="menu"
                        aria-label="Filter status insiden"
                        className="absolute left-1/2 mt-2 w-60 -translate-x-1/2 space-y-1 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl"
                    >
                        {STATUS_FILTER_OPTIONS.map((option) => {
                            const isActive =
                                (option.key === 'all' &&
                                    activeStatus === null) ||
                                option.key === activeStatus;
                            const count = statusCounts[option.key];

                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={isActive}
                                    onClick={() => handleSelect(option.key)}
                                    className={`flex min-h-[38px] w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-[#006194] text-white'
                                            : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {option.dotColor && (
                                            <span
                                                className={`size-2 rounded-full ${option.dotColor}`}
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span>{option.label}</span>
                                    </span>
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
                )}
            </div>

            {/* Desktop: Full Horizontal Pill Bar */}
            <div
                className="pointer-events-auto hidden max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/60 bg-white/92 p-1.5 shadow-lg backdrop-blur-xl md:flex"
                role="group"
                aria-label="Filter status insiden"
            >
                {STATUS_FILTER_OPTIONS.map((option) => {
                    const isActive =
                        (option.key === 'all' && activeStatus === null) ||
                        option.key === activeStatus;
                    const count = statusCounts[option.key];

                    return (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => onSelectStatus(option.key)}
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
    );
}
