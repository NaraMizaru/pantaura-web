<?php

declare(strict_types=1);

namespace App\Enums;

enum SafeZoneType: string
{
    case Posko = 'posko';
    case Evacuation = 'evacuation';
    case Medical = 'medical';
    case Logistics = 'logistics';

    public function label(): string
    {
        return match ($this) {
            self::Posko => 'Posko Siaga',
            self::Evacuation => 'Titik Evakuasi',
            self::Medical => 'Pos Kesehatan',
            self::Logistics => 'Dapur Umum / Logistik',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
