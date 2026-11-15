<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\IncidentStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin IncidentStatusHistory
 */
class IncidentStatusHistoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'previous_status' => $this->previous_status?->value,
            'new_status' => $this->new_status->value,
            'reason' => $this->reason,
            'changed_by' => $this->whenLoaded('actor', fn () => [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
