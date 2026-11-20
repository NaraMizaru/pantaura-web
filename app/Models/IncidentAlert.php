<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $incident_id
 * @property string $watch_area_id
 * @property int $distance_meters
 * @property Carbon|null $read_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'incident_id',
    'watch_area_id',
    'distance_meters',
    'read_at',
])]
class IncidentAlert extends Model
{
    use HasUuids;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Incident, $this>
     */
    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    /**
     * @return BelongsTo<WatchArea, $this>
     */
    public function watchArea(): BelongsTo
    {
        return $this->belongsTo(WatchArea::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'distance_meters' => 'integer',
            'read_at' => 'datetime',
        ];
    }
}
