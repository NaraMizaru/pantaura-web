import 'leaflet/dist/leaflet.css';
import { Link } from '@inertiajs/react';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import { IncidentStatusBadge } from '@/features/incidents/components/StatusBadge';
import { DISASTER_TYPE_LABELS } from '@/features/incidents/lib/disaster';
import type { IncidentMarker, IncidentStatus } from '@/types/siagakita';

const STATUS_PIN_COLORS: Record<IncidentStatus, string> = {
    unverified: '#d97706',
    verified: '#dc2626',
    resolution_submitted: '#2563eb',
    resolved: '#059669',
    rejected: '#525252',
};

/** Batas geografis Indonesia agar peta tidak mengulang (infinite map) dan tetap fokus di wilayah Indonesia. */
const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [
    [-11.5, 94.5],
    [6.5, 141.5],
];

const MIN_INDONESIA_ZOOM = 5;
const CLUSTER_RADIUS_PX = 48;
const UNCLUSTER_ZOOM = 15;

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

function createClusterIcon(incidentCount: number): L.DivIcon {
    const size = incidentCount >= 20 ? 44 : 38;
    const displayCount = incidentCount > 99 ? '99+' : String(incidentCount);

    return L.divIcon({
        className: 'siagakita-cluster-marker',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:#006194;color:#ffffff;font-weight:800;font-size:13px;border:3px solid #ffffff;box-shadow:0 0 0 4px rgba(0,97,148,0.28),0 4px 10px rgba(0,0,0,0.3);">${displayCount}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

type IncidentCluster = {
    id: string;
    latitude: number;
    longitude: number;
    anchorPoint: L.Point;
    items: IncidentMarker[];
};

function MapFocusController({
    incidents,
    selectedIncidentId,
    focusTrigger,
    markerRefs,
}: {
    incidents: IncidentMarker[];
    selectedIncidentId: string | null;
    focusTrigger: number;
    markerRefs: React.RefObject<Record<string, L.Marker | null>>;
}) {
    const map = useMap();

    useEffect(() => {
        if (focusTrigger <= 0 || !selectedIncidentId) {
            return;
        }

        const target = incidents.find((item) => item.id === selectedIncidentId);
        if (!target) {
            return;
        }

        const targetZoom = Math.max(map.getZoom(), UNCLUSTER_ZOOM);
        let opened = false;

        const openTargetPopup = () => {
            if (opened) {
                return;
            }
            opened = true;
            markerRefs.current[target.id]?.openPopup();
        };

        map.once('moveend', openTargetPopup);
        map.flyTo([target.latitude, target.longitude], targetZoom, {
            duration: 0.65,
        });

        const fallbackTimer = window.setTimeout(openTargetPopup, 750);

        return () => {
            map.off('moveend', openTargetPopup);
            window.clearTimeout(fallbackTimer);
        };
    }, [focusTrigger, selectedIncidentId, incidents, map, markerRefs]);

    return null;
}

function ClusteredMarkers({
    incidents,
    detailBasePath,
    markerRefs,
}: {
    incidents: IncidentMarker[];
    detailBasePath: string;
    markerRefs: React.RefObject<Record<string, L.Marker | null>>;
}) {
    const map = useMap();
    const [currentZoom, setCurrentZoom] = useState<number>(() => map.getZoom());

    useMapEvents({
        zoomend: () => {
            setCurrentZoom(map.getZoom());
        },
    });

    const clusters = useMemo<IncidentCluster[]>(() => {
        if (currentZoom >= UNCLUSTER_ZOOM || incidents.length <= 1) {
            return incidents.map((incident) => ({
                id: incident.id,
                latitude: incident.latitude,
                longitude: incident.longitude,
                anchorPoint: map.project(
                    L.latLng(incident.latitude, incident.longitude),
                    currentZoom,
                ),
                items: [incident],
            }));
        }

        const grouped: IncidentCluster[] = [];

        for (const incident of incidents) {
            const point = map.project(
                L.latLng(incident.latitude, incident.longitude),
                currentZoom,
            );

            const match = grouped.find(
                (cluster) =>
                    cluster.anchorPoint.distanceTo(point) < CLUSTER_RADIUS_PX,
            );

            if (match) {
                match.items.push(incident);
                const total = match.items.length;
                match.latitude =
                    match.items.reduce((sum, item) => sum + item.latitude, 0) /
                    total;
                match.longitude =
                    match.items.reduce((sum, item) => sum + item.longitude, 0) /
                    total;
            } else {
                grouped.push({
                    id: incident.id,
                    latitude: incident.latitude,
                    longitude: incident.longitude,
                    anchorPoint: point,
                    items: [incident],
                });
            }
        }

        return grouped;
    }, [incidents, currentZoom, map]);

    return (
        <>
            {clusters.map((cluster) => {
                if (cluster.items.length === 1) {
                    const incident = cluster.items[0];
                    return (
                        <Marker
                            key={incident.id}
                            ref={(ref) => {
                                markerRefs.current[incident.id] = ref;
                            }}
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
                                                ] ??
                                                    incident.disaster_type_label}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-neutral-600">
                                            {incident.reports_count} laporan
                                        </span>
                                    </div>
                                    <p className="text-sm leading-snug font-semibold text-neutral-900">
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
                    );
                }

                return (
                    <Marker
                        key={`cluster-${cluster.id}-${cluster.items.length}`}
                        position={[cluster.latitude, cluster.longitude]}
                        icon={createClusterIcon(cluster.items.length)}
                        eventHandlers={{
                            click: () => {
                                const bounds = L.latLngBounds(
                                    cluster.items.map((item) => [
                                        item.latitude,
                                        item.longitude,
                                    ]),
                                );

                                if (
                                    bounds
                                        .getNorthEast()
                                        .equals(bounds.getSouthWest())
                                ) {
                                    map.flyTo(
                                        [cluster.latitude, cluster.longitude],
                                        Math.min(
                                            currentZoom + 2,
                                            UNCLUSTER_ZOOM,
                                        ),
                                        { duration: 0.5 },
                                    );
                                    return;
                                }

                                map.flyToBounds(bounds, {
                                    padding: [48, 48],
                                    maxZoom: UNCLUSTER_ZOOM + 1,
                                    duration: 0.5,
                                });
                            },
                        }}
                    />
                );
            })}
        </>
    );
}

type DisasterMapProps = {
    incidents: IncidentMarker[];
    selectedIncidentId?: string | null;
    focusTrigger?: number;
    className?: string;
    zoom?: number;
    detailBasePath?: string;
};

export function DisasterMap({
    incidents,
    selectedIncidentId = null,
    focusTrigger = 0,
    className = 'h-[420px] w-full rounded-lg border',
    zoom = 12,
    detailBasePath = '/incidents',
}: DisasterMapProps) {
    const markerRefs = useRef<Record<string, L.Marker | null>>({});

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
        <div
            className={className}
            role="region"
            aria-label="Peta persebaran insiden bencana"
        >
            <MapContainer
                center={center}
                zoom={Math.max(zoom, MIN_INDONESIA_ZOOM)}
                minZoom={MIN_INDONESIA_ZOOM}
                maxBounds={INDONESIA_BOUNDS}
                maxBoundsViscosity={1.0}
                worldCopyJump={false}
                scrollWheelZoom
                className="z-0 h-full w-full rounded-lg"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    noWrap
                    bounds={INDONESIA_BOUNDS}
                />
                <MapFocusController
                    incidents={incidents}
                    selectedIncidentId={selectedIncidentId}
                    focusTrigger={focusTrigger}
                    markerRefs={markerRefs}
                />
                <ClusteredMarkers
                    incidents={incidents}
                    detailBasePath={detailBasePath}
                    markerRefs={markerRefs}
                />
            </MapContainer>
        </div>
    );
}
