<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ResolutionStatus;
use Database\Factories\ResolutionSubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $incident_id
 * @property string $user_id
 * @property string $description
 * @property ResolutionStatus $status
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
    'status',
    'reviewed_by',
    'reviewed_at',
    'rejection_reason',
])]
class ResolutionSubmission extends Model
{
    /** @use HasFactory<ResolutionSubmissionFactory> */
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
    public function submitter(): BelongsTo
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
     * @return HasMany<ResolutionMedia, $this>
     */
    public function media(): HasMany
    {
        return $this->hasMany(ResolutionMedia::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ResolutionStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }
}
