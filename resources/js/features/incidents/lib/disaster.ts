import type { DisasterType, SafeZoneType, UrgentNeed } from '@/types/pantaura';

export const DISASTER_TYPE_LABELS: Record<DisasterType, string> = {
    flood: 'Banjir',
    earthquake: 'Gempa Bumi',
    landslide: 'Tanah Longsor',
    fire: 'Kebakaran',
};

export const DISASTER_TYPE_OPTIONS: Array<{
    value: DisasterType;
    label: string;
}> = [
    { value: 'flood', label: DISASTER_TYPE_LABELS.flood },
    { value: 'earthquake', label: DISASTER_TYPE_LABELS.earthquake },
    { value: 'landslide', label: DISASTER_TYPE_LABELS.landslide },
    { value: 'fire', label: DISASTER_TYPE_LABELS.fire },
];

export const DISASTER_TYPE_BADGE_CLASSES: Record<DisasterType, string> = {
    flood: 'bg-blue-50 text-blue-700',
    earthquake: 'bg-amber-50 text-amber-700',
    landslide: 'bg-orange-50 text-orange-700',
    fire: 'bg-red-50 text-red-700',
};

export const URGENT_NEED_LABELS: Record<UrgentNeed, string> = {
    rubber_boat: 'Perahu Karet',
    medical_evacuation: 'Evakuasi Medis',
    clean_water: 'Air Bersih',
    food: 'Makanan & Logistik',
    power_outage: 'Listrik Padam',
    shelter: 'Tenda / Pengungsian',
};

export const URGENT_NEED_OPTIONS: Array<{
    value: UrgentNeed;
    label: string;
}> = [
    { value: 'rubber_boat', label: URGENT_NEED_LABELS.rubber_boat },
    {
        value: 'medical_evacuation',
        label: URGENT_NEED_LABELS.medical_evacuation,
    },
    { value: 'clean_water', label: URGENT_NEED_LABELS.clean_water },
    { value: 'food', label: URGENT_NEED_LABELS.food },
    { value: 'power_outage', label: URGENT_NEED_LABELS.power_outage },
    { value: 'shelter', label: URGENT_NEED_LABELS.shelter },
];

export const SAFE_ZONE_TYPE_LABELS: Record<SafeZoneType, string> = {
    posko: 'Posko Siaga',
    evacuation: 'Titik Evakuasi',
    medical: 'Pos Kesehatan',
    logistics: 'Dapur Umum / Logistik',
};

export const SAFE_ZONE_TYPE_OPTIONS: Array<{
    value: SafeZoneType;
    label: string;
}> = [
    { value: 'posko', label: SAFE_ZONE_TYPE_LABELS.posko },
    { value: 'evacuation', label: SAFE_ZONE_TYPE_LABELS.evacuation },
    { value: 'medical', label: SAFE_ZONE_TYPE_LABELS.medical },
    { value: 'logistics', label: SAFE_ZONE_TYPE_LABELS.logistics },
];
