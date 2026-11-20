<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\IncidentAlert;
use App\Models\WatchArea;

class WatchAreaAlertService
{
    public function __construct(
        private readonly IncidentService $incidentService,
    ) {}

    /**
     * Create geofence alerts for users whose watch areas cover a newly verified incident.
     * shortcut: Bounding-box + PHP Haversine over watch_areas instead of PostGIS ST_DWithin.
     */
    public function notifyForVerifiedIncident(Incident $incident): int
    {
        if ($incident->status !== IncidentStatus::Verified) {
            return 0;
        }

        $maxRadiusKm = 10.0;
        $latDelta = $maxRadiusKm / 111.0;
        $lngDelta = $maxRadiusKm / (111.0 * max(0.1, cos(deg2rad($incident->latitude))));

        $watchAreas = WatchArea::query()
            ->whereBetween('latitude', [$incident->latitude - $latDelta, $incident->latitude + $latDelta])
            ->whereBetween('longitude', [$incident->longitude - $lngDelta, $incident->longitude + $lngDelta])
            ->get();

        $createdCount = 0;

        foreach ($watchAreas as $area) {
            $distanceMeters = (int) round(
                $this->incidentService->haversineKm(
                    $incident->latitude,
                    $incident->longitude,
                    $area->latitude,
                    $area->longitude,
                ) * 1000
            );

            if ($distanceMeters > $area->radius_meters) {
                continue;
            }

            $alert = IncidentAlert::firstOrCreate(
                [
                    'user_id' => $area->user_id,
                    'incident_id' => $incident->id,
                ],
                [
                    'watch_area_id' => $area->id,
                    'distance_meters' => $distanceMeters,
                ]
            );

            if ($alert->wasRecentlyCreated) {
                $createdCount++;
            }
        }

        return $createdCount;
    }
}
