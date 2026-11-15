<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Citizen = 'citizen';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Citizen => 'Masyarakat',
            self::Admin => 'Administrator',
        };
    }
}
