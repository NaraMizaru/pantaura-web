<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\WatchArea;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin WatchArea
 */
class WatchAreaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'radius_meters' => $this->radius_meters,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
