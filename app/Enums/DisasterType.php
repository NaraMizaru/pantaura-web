<?php

declare(strict_types=1);

namespace App\Enums;

enum DisasterType: string
{
    case Flood = 'flood';
    case Earthquake = 'earthquake';
    case Landslide = 'landslide';
    case Fire = 'fire';

    public function label(): string
    {
        return match ($this) {
            self::Flood => 'Banjir',
            self::Earthquake => 'Gempa Bumi',
            self::Landslide => 'Tanah Longsor',
            self::Fire => 'Kebakaran',
        };
    }

    public function titlePrefix(): string
    {
        return $this->label();
    }

    public function color(): string
    {
        return match ($this) {
            self::Flood => '#2563eb',
            self::Earthquake => '#d97706',
            self::Landslide => '#b45309',
            self::Fire => '#dc2626',
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
