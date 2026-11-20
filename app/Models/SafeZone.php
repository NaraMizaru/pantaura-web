<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SafeZoneType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property SafeZoneType $type
 * @property string|null $description
 * @property float $latitude
 * @property float $longitude
 * @property string|null $address
 * @property int|null $capacity
 * @property bool $is_active
 * @property string|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'type',
    'description',
    'latitude',
    'longitude',
    'address',
    'capacity',
    'is_active',
    'created_by',
])]
class SafeZone extends Model
{
    use HasUuids;

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => SafeZoneType::class,
            'latitude' => 'float',
            'longitude' => 'float',
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
