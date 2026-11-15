<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\MediaType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class MediaStorageService
{
    /**
     * Store uploaded media files on the public disk and return metadata.
     * Cleans up any already-stored files if a subsequent file fails.
     *
     * @param  array<int, UploadedFile>  $files
     * @return array<int, array{file_path: string, file_type: MediaType, original_filename: string, file_size: int}>
     */
    public function storeMany(array $files, string $directory): array
    {
        $stored = [];

        try {
            foreach ($files as $file) {
                $path = $file->store($directory, 'public');

                if ($path === false) {
                    throw new RuntimeException('Gagal menyimpan file media.');
                }

                $stored[] = [
                    'file_path' => $path,
                    'file_type' => MediaType::fromMimeType($file->getMimeType()),
                    'original_filename' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize() ?: 0,
                ];
            }
        } catch (\Throwable $e) {
            $this->deletePaths(array_column($stored, 'file_path'));

            throw $e;
        }

        return $stored;
    }

    /**
     * @param  array<int, string>  $paths
     */
    public function deletePaths(array $paths): void
    {
        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
        }
    }
}
