<?php

declare(strict_types=1);

namespace App\Enums;

enum MediaType: string
{
    case Image = 'image';
    case Video = 'video';

    public static function fromMimeType(?string $mimeType): self
    {
        if ($mimeType !== null && str_starts_with($mimeType, 'video/')) {
            return self::Video;
        }

        return self::Image;
    }
}
