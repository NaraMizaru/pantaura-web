import { Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IncidentStatusBadge } from '@/features/incidents/components/StatusBadge';
import { DISASTER_TYPE_LABELS } from '@/features/incidents/lib/disaster';
import {
    formatIncidentDate,
    STATUS_STRIPE_COLOR,
} from '@/features/public-map/constants';
import type { IncidentMarker } from '@/types/siagakita';

export function IncidentCard({
    incident,
    isSelected,
    onFocusMap,
}: {
    incident: IncidentMarker;
    isSelected: boolean;
    onFocusMap: (id: string) => void;
}) {
    return (
        <article
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
                    <IncidentStatusBadge status={incident.status} />
                    <span className="rounded-full bg-[#eff4ff] px-2.5 py-0.5 text-xs font-semibold text-[#004b73]">
                        {DISASTER_TYPE_LABELS[incident.disaster_type]}
                    </span>
                </div>
                <span className="rounded-full bg-[#eff4ff] px-2.5 py-0.5 text-xs font-semibold text-[#004b73] tabular-nums">
                    {incident.reports_count} laporan warga
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
                    {formatIncidentDate(incident.created_at)}
                </span>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onFocusMap(incident.id)}
                        className="min-h-[38px] border-slate-200 bg-[#eff4ff] text-[#004b73] hover:bg-[#dce9ff] hover:text-[#004b73] dark:border-slate-200 dark:bg-[#eff4ff] dark:text-[#004b73] dark:hover:bg-[#dce9ff] dark:hover:text-[#004b73]"
                    >
                        Fokus Peta
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        className="min-h-[38px] bg-[#006194] text-white hover:bg-[#004b73]"
                    >
                        <Link href={`/incidents/${incident.id}`}>
                            Detail &amp; Bukti
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}
