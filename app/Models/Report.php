<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ModerationStatus;
use Database\Factories\ReportFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string|null $incident_id
 * @property string $user_id
 * @property string $description
 * @property float $latitude
 * @property float $longitude
 * @property Carbon $submitted_at
 * @property ModerationStatus $moderation_status
 * @property string|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property string|null $rejection_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'incident_id',
    'user_id',
    'description',
    'latitude',
    'longitude',
    'submitted_at',
    'moderation_status',
    'reviewed_by',
    'reviewed_at',
    'rejection_reason',
])]
class Report extends Model
{
    /** @use HasFactory<ReportFactory> */
    use HasFactory, HasUuids;

    /**
     * @return BelongsTo<Incident, $this>
     */
    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @return HasMany<ReportMedia, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(ReportMedia::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'submitted_at' => 'datetime',
            'moderation_status' => ModerationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }
}
