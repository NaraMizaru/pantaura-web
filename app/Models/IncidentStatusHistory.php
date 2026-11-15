<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\IncidentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $incident_id
 * @property IncidentStatus|null $previous_status
 * @property IncidentStatus $new_status
 * @property string $changed_by
 * @property string|null $reason
 * @property Carbon|null $created_at
 */
#[Fillable([
    'incident_id',
    'previous_status',
    'new_status',
    'changed_by',
    'reason',
    'created_at',
])]
class IncidentStatusHistory extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

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
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'previous_status' => IncidentStatus::class,
            'new_status' => IncidentStatus::class,
            'created_at' => 'datetime',
        ];
    }
}
