import type { DisasterType } from '@/types/siagakita';

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
