<?php

declare(strict_types=1);

namespace App\Enums;

enum UrgentNeed: string
{
    case RubberBoat = 'rubber_boat';
    case MedicalEvacuation = 'medical_evacuation';
    case CleanWater = 'clean_water';
    case Food = 'food';
    case PowerOutage = 'power_outage';
    case Shelter = 'shelter';

    public function label(): string
    {
        return match ($this) {
            self::RubberBoat => 'Perahu Karet',
            self::MedicalEvacuation => 'Evakuasi Medis',
            self::CleanWater => 'Air Bersih',
            self::Food => 'Makanan & Logistik',
            self::PowerOutage => 'Listrik Padam',
            self::Shelter => 'Tenda / Pengungsian',
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
