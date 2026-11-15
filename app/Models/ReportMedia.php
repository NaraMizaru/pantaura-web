<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MediaType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property string $id
 * @property string $report_id
 * @property string $file_path
 * @property MediaType $file_type
 * @property string $original_filename
 * @property int $file_size
 * @property Carbon|null $created_at
 */
#[Fillable([
    'report_id',
    'file_path',
    'file_type',
    'original_filename',
    'file_size',
    'created_at',
])]
class ReportMedia extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    /**
     * @return BelongsTo<Report, $this>
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_type' => MediaType::class,
            'file_size' => 'integer',
            'created_at' => 'datetime',
        ];
    }
}
