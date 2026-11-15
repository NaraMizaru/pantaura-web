<?php

declare(strict_types=1);

namespace App\Enums;

enum IncidentStatus: string
{
    case Unverified = 'unverified';
    case Verified = 'verified';
    case ResolutionSubmitted = 'resolution_submitted';
    case Resolved = 'resolved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Unverified => 'Belum Diverifikasi',
            self::Verified => 'Terverifikasi',
            self::ResolutionSubmitted => 'Pengajuan Selesai',
            self::Resolved => 'Selesai',
            self::Rejected => 'Ditolak',
        };
    }

    public function isPubliclyVisible(): bool
    {
        return $this !== self::Rejected;
    }

    /**
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Unverified => [self::Verified, self::Rejected],
            self::Verified => [self::ResolutionSubmitted],
            self::ResolutionSubmitted => [self::Resolved, self::Verified],
            self::Resolved, self::Rejected => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }

    /**
     * @return list<self>
     */
    public static function publiclyVisibleStatuses(): array
    {
        return [
            self::Unverified,
            self::Verified,
            self::ResolutionSubmitted,
            self::Resolved,
        ];
    }
}
