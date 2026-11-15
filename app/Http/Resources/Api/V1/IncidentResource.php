<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Incident
 */
class IncidentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'address' => $this->address,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'reports_count' => $this->whenCounted('reports'),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'reports' => ReportResource::collection($this->whenLoaded('reports')),
            'resolutions' => ResolutionSubmissionResource::collection($this->whenLoaded('resolutionSubmissions')),
            'status_histories' => IncidentStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
        ];
    }
}
