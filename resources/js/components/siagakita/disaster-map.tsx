import 'leaflet/dist/leaflet.css';
import { Link } from '@inertiajs/react';
import L from 'leaflet';
import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { IncidentStatusBadge } from '@/components/siagakita/status-badge';
import { DISASTER_TYPE_LABELS } from '@/lib/disaster';
import type { IncidentMarker, IncidentStatus } from '@/types/siagakita';

const STATUS_PIN_COLORS: Record<IncidentStatus, string> = {
    unverified: '#d97706',
    verified: '#dc2626',
    resolution_submitted: '#2563eb',
    resolved: '#059669',
    rejected: '#525252',
};

function createIncidentIcon(status: IncidentStatus, count: number): L.DivIcon {
    const color = STATUS_PIN_COLORS[status];
    const displayCount = count > 99 ? '99+' : String(count);

    return L.divIcon({
        className: 'siagakita-marker',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:${color};color:#ffffff;font-weight:700;font-size:12px;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">${displayCount}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
}

type DisasterMapProps = {
    incidents: IncidentMarker[];
    selectedIncidentId?: string | null;
    className?: string;
    zoom?: number;
    detailBasePath?: string;
};

export function DisasterMap({
    incidents,
    selectedIncidentId = null,
    className = 'h-[420px] w-full rounded-lg border',
    zoom = 12,
    detailBasePath = '/incidents',
}: DisasterMapProps) {
    const center = useMemo<[number, number]>(() => {
        if (selectedIncidentId) {
            const found = incidents.find((i) => i.id === selectedIncidentId);
            if (found) {
                return [found.latitude, found.longitude];
            }
        }

        if (incidents.length > 0) {
            return [incidents[0].latitude, incidents[0].longitude];
        }

        return [-6.2088, 106.8456];
    }, [incidents, selectedIncidentId]);

    return (
        <div className={className} role="region" aria-label="Peta persebaran insiden bencana">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom
                className="z-0 h-full w-full rounded-lg"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {incidents.map((incident) => (
                    <Marker
                        key={incident.id}
                        position={[incident.latitude, incident.longitude]}
                        icon={createIncidentIcon(
                            incident.status,
                            incident.reports_count,
                        )}
                    >
                        <Popup minWidth={230}>
                            <div className="space-y-2 py-0.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <IncidentStatusBadge
                                            status={incident.status}
                                        />
                                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                                            {DISASTER_TYPE_LABELS[
                                                incident.disaster_type
                                            ] ?? incident.disaster_type_label}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-neutral-600">
                                        {incident.reports_count} laporan
                                    </span>
                                </div>
                                <p className="text-sm font-semibold leading-snug text-neutral-900">
                                    {incident.title}
                                </p>
                                {incident.address && (
                                    <p className="text-xs text-neutral-600">
                                        {incident.address}
                                    </p>
                                )}
                                <Link
                                    href={`${detailBasePath}/${incident.id}`}
                                    className="inline-flex min-h-[36px] items-center text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                                >
                                    Lihat detail insiden
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
