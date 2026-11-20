import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMapEvents,
} from 'react-leaflet';
import type { SafeZoneMarker } from '@/types/pantaura';

const INDONESIA_BOUNDS: L.LatLngBoundsExpression = [
    [-11.5, 94.5],
    [6.5, 141.5],
];

function createSafeZoneIcon(isActive: boolean): L.DivIcon {
    const bg = isActive ? '#0f766e' : '#64748b';

    return L.divIcon({
        className: 'pantaura-safezone-marker',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;background:${bg};color:#ffffff;font-weight:800;font-size:14px;border:2.5px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">+</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
    });
}

function createDraftPinIcon(): L.DivIcon {
    return L.divIcon({
        className: 'pantaura-draft-safezone-marker',
        html: '<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:#0284c7;color:#ffffff;font-weight:800;font-size:14px;border:3px solid #ffffff;box-shadow:0 0 0 4px rgba(2,132,199,0.3),0 3px 10px rgba(0,0,0,0.35);">📍</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
}

function MapClickPicker({
    onPick,
}: {
    onPick: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click: (e) => {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });

    return null;
}

export function SafeZonePickerMap({
    safeZones,
    pickedLatitude,
    pickedLongitude,
    onPickCoordinates,
}: {
    safeZones: SafeZoneMarker[];
    pickedLatitude: number | null;
    pickedLongitude: number | null;
    onPickCoordinates: (lat: number, lng: number) => void;
}) {
    const initialCenter: [number, number] =
        pickedLatitude !== null && pickedLongitude !== null
            ? [pickedLatitude, pickedLongitude]
            : safeZones.length > 0
              ? [safeZones[0].latitude, safeZones[0].longitude]
              : [-6.2088, 106.8456];

    return (
        <div
            className="h-[340px] w-full overflow-hidden rounded-lg border"
            role="region"
            aria-label="Peta pilih koordinat Posko dan Titik Aman"
        >
            <MapContainer
                center={initialCenter}
                zoom={12}
                minZoom={5}
                maxBounds={INDONESIA_BOUNDS}
                maxBoundsViscosity={1.0}
                worldCopyJump={false}
                scrollWheelZoom
                className="z-0 h-full w-full cursor-crosshair"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    noWrap
                    bounds={INDONESIA_BOUNDS}
                />
                <MapClickPicker onPick={onPickCoordinates} />

                {safeZones.map((zone) => (
                    <Marker
                        key={zone.id}
                        position={[zone.latitude, zone.longitude]}
                        icon={createSafeZoneIcon(Boolean(zone.is_active))}
                    >
                        <Popup minWidth={200}>
                            <div className="space-y-1 text-xs">
                                <p className="font-semibold text-neutral-900">
                                    {zone.name}
                                </p>
                                <p className="text-neutral-600">
                                    {zone.type_label} •{' '}
                                    {zone.is_active ? 'Aktif' : 'Nonaktif'}
                                </p>
                                {zone.address && (
                                    <p className="text-neutral-600">
                                        {zone.address}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {pickedLatitude !== null && pickedLongitude !== null && (
                    <Marker
                        position={[pickedLatitude, pickedLongitude]}
                        icon={createDraftPinIcon()}
                    >
                        <Popup>
                            <div className="text-xs font-medium text-neutral-900">
                                Titik baru dipilih:{' '}
                                {pickedLatitude.toFixed(5)},{' '}
                                {pickedLongitude.toFixed(5)}
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
