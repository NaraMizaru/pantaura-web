<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\DisasterType;
use App\Enums\IncidentStatus;
use App\Enums\UrgentNeed;
use App\Models\Incident;
use App\Models\IncidentConfirmation;
use App\Models\IncidentStatusHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class IncidentService
{
    /**
     * Find nearby active/visible incidents for admin grouping recommendations.
     * shortcut: Haversine in PHP over bounding-box pre-filter instead of PostGIS; upgrade if dataset grows multi-region.
     *
     * @return Collection<int, Incident>
     */
    public function findNearbyCandidates(
        float $latitude,
        float $longitude,
        ?string $excludeIncidentId = null,
        ?DisasterType $type = null,
        float $radiusKm = 1.5,
        int $hoursWindow = 72,
    ): Collection {
        $latDelta = $radiusKm / 111.0;
        $lngDelta = $radiusKm / (111.0 * max(0.1, cos(deg2rad($latitude))));

        $candidates = Incident::query()
            ->publiclyVisible()
            ->where('status', '!=', IncidentStatus::Resolved->value)
            ->when($excludeIncidentId !== null, fn ($q) => $q->where('id', '!=', $excludeIncidentId))
            ->when($type !== null, fn ($q) => $q->where('disaster_type', $type->value))
            ->whereBetween('latitude', [$latitude - $latDelta, $latitude + $latDelta])
            ->whereBetween('longitude', [$longitude - $lngDelta, $longitude + $lngDelta])
            ->where('created_at', '>=', now()->subHours($hoursWindow))
            ->withCount('reports')
            ->get();

        return $candidates
            ->map(function (Incident $incident) use ($latitude, $longitude): Incident {
                $distanceKm = $this->haversineKm($latitude, $longitude, $incident->latitude, $incident->longitude);
                $incident->setAttribute('distance_meters', (int) round($distanceKm * 1000));

                return $incident;
            })
            ->filter(fn (Incident $incident): bool => ($incident->getAttribute('distance_meters') ?? PHP_INT_MAX) <= ($radiusKm * 1000))
            ->sortBy('distance_meters')
            ->values();
    }

    public function transitionStatus(
        Incident $incident,
        IncidentStatus $newStatus,
        User $actor,
        ?string $reason = null,
    ): Incident {
        if (! $incident->status->canTransitionTo($newStatus)) {
            throw new InvalidArgumentException(
                "Transisi status dari {$incident->status->value} ke {$newStatus->value} tidak diizinkan."
            );
        }

        $previousStatus = $incident->status;

        $updated = DB::transaction(function () use ($incident, $newStatus, $actor, $reason, $previousStatus): Incident {
            $attributes = ['status' => $newStatus];

            if ($newStatus === IncidentStatus::Verified && $incident->verified_at === null) {
                $attributes['verified_by'] = $actor->id;
                $attributes['verified_at'] = now();
            }

            if ($newStatus === IncidentStatus::Resolved) {
                $attributes['resolved_at'] = now();
            }

            $incident->update($attributes);

            IncidentStatusHistory::create([
                'incident_id' => $incident->id,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'changed_by' => $actor->id,
                'reason' => $reason,
                'created_at' => now(),
            ]);

            return $incident->refresh();
        });

        if ($previousStatus !== IncidentStatus::Verified && $newStatus === IncidentStatus::Verified) {
            app(WatchAreaAlertService::class)->notifyForVerifiedIncident($updated);
        }

        return $updated;
    }

    /**
     * Toggle a citizen confirmation ("Konfirmasi Warga") on an active incident.
     *
     * @return array{confirmed: bool, confirmations_count: int}
     */
    public function toggleConfirmation(Incident $incident, User $user): array
    {
        if (! $incident->status->isPubliclyVisible() || $incident->status === IncidentStatus::Resolved) {
            throw new InvalidArgumentException('Insiden tidak dapat dikonfirmasi pada status saat ini.');
        }

        return DB::transaction(function () use ($incident, $user): array {
            $existing = IncidentConfirmation::query()
                ->where('incident_id', $incident->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existing !== null) {
                $existing->delete();
                $confirmed = false;
            } else {
                IncidentConfirmation::create([
                    'incident_id' => $incident->id,
                    'user_id' => $user->id,
                ]);
                $confirmed = true;
            }

            return [
                'confirmed' => $confirmed,
                'confirmations_count' => $incident->confirmations()->count(),
            ];
        });
    }

    /**
     * @param  list<string>  $needs
     */
    public function updateUrgentNeeds(Incident $incident, array $needs): Incident
    {
        $valid = array_values(array_unique(array_filter(
            $needs,
            fn (string $need): bool => UrgentNeed::tryFrom($need) !== null,
        )));

        $incident->update([
            'urgent_needs' => $valid,
        ]);

        return $incident->refresh();
    }

    public function haversineKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadiusKm = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return 2 * $earthRadiusKm * asin(min(1.0, sqrt($a)));
    }
}
