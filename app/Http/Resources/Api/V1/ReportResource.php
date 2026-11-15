<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Report
 */
class ReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'incident_id' => $this->incident_id,
            'description' => $this->description,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'submitted_at' => $this->submitted_at->toIso8601String(),
            'moderation_status' => $this->moderation_status->value,
            'rejection_reason' => $this->rejection_reason,
            'reporter' => $this->whenLoaded('reporter', fn () => [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
            ]),
            'media' => MediaResource::collection($this->whenLoaded('media')),
            'incident' => new IncidentResource($this->whenLoaded('incident')),
        ];
    }
}
