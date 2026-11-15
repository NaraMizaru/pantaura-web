<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\IncidentStatus;
use Database\Factories\IncidentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $title
 * @property string $description
 * @property float $latitude
 * @property float $longitude
 * @property string|null $address
 * @property IncidentStatus $status
 * @property string|null $verified_by
 * @property Carbon|null $verified_at
 * @property Carbon|null $resolved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'title',
    'description',
    'latitude',
    'longitude',
    'address',
    'status',
    'verified_by',
    'verified_at',
    'resolved_at',
])]
class Incident extends Model
{
    /** @use HasFactory<IncidentFactory> */
    use HasFactory, HasUuids;

    /**
     * @return BelongsTo<User, $this>
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class)->latest('submitted_at');
    }

    /**
     * @return HasMany<ResolutionSubmission, $this>
     */
    public function resolutionSubmissions(): HasMany
    {
        return $this->hasMany(ResolutionSubmission::class)->latest();
    }

    /**
     * @return HasMany<IncidentStatusHistory, $this>
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(IncidentStatusHistory::class)->latest('created_at');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where('status', '!=', IncidentStatus::Rejected->value);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'status' => IncidentStatus::class,
            'verified_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }
}
