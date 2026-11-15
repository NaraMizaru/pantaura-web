export type DisasterType = 'flood' | 'earthquake' | 'landslide' | 'fire';

export type IncidentStatus =
    | 'unverified'
    | 'verified'
    | 'resolution_submitted'
    | 'resolved'
    | 'rejected';

export type ModerationStatus = 'pending' | 'verified' | 'rejected';

export type ResolutionStatus = 'pending' | 'approved' | 'rejected';

export type MediaType = 'image' | 'video';

export type MediaItem = {
    id: string;
    url: string;
    file_type: MediaType;
    original_filename: string;
};

export type IncidentMarker = {
    id: string;
    title: string;
    disaster_type: DisasterType;
    disaster_type_label: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string | null;
    status: IncidentStatus;
    status_label: string;
    reports_count: number;
    created_at: string | null;
};

export type StatusCounts = {
    all: number;
    unverified: number;
    verified: number;
    resolution_submitted: number;
    resolved: number;
};

export type DisasterTypeCounts = {
    all: number;
    flood: number;
    earthquake: number;
    landslide: number;
    fire: number;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
