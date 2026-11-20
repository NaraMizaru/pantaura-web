<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Enums\DisasterType;
use App\Enums\UrgentNeed;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'disaster_type' => ['sometimes', Rule::enum(DisasterType::class)],
            'urgent_needs' => ['sometimes', 'array', 'max:6'],
            'urgent_needs.*' => ['required', Rule::enum(UrgentNeed::class)],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'address' => ['nullable', 'string', 'max:255'],
            'media' => ['required', 'array', 'min:1', 'max:5'],
            'media.*' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime', 'max:20480'],
        ];
    }
}
