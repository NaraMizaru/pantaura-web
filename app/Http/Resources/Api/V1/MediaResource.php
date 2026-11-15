<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\ReportMedia;
use App\Models\ResolutionMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReportMedia|ResolutionMedia
 */
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'file_type' => $this->file_type->value,
            'original_filename' => $this->original_filename,
            'file_size' => $this->file_size,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
