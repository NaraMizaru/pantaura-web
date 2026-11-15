<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\IncidentStatus;
use App\Enums\ResolutionStatus;
use App\Models\Incident;
use App\Models\ResolutionSubmission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ResolutionService
{
    public function __construct(
        private readonly MediaStorageService $mediaStorage,
        private readonly IncidentService $incidentService,
    ) {}

    /**
     * @param  array<int, UploadedFile>  $files
     */
    public function submitResolution(User $citizen, Incident $incident, string $description, array $files): ResolutionSubmission
    {
        if ($incident->status !== IncidentStatus::Verified) {
            throw new InvalidArgumentException('Pengajuan penyelesaian hanya dapat dikirim untuk insiden berstatus terverifikasi.');
        }

        $storedMedia = $this->mediaStorage->storeMany($files, 'resolutions');

        try {
            return DB::transaction(function () use ($citizen, $incident, $description, $storedMedia): ResolutionSubmission {
                $submission = ResolutionSubmission::create([
                    'incident_id' => $incident->id,
                    'user_id' => $citizen->id,
                    'description' => $description,
                    'status' => ResolutionStatus::Pending,
                ]);

                foreach ($storedMedia as $media) {
                    $submission->media()->create([
                        ...$media,
                        'created_at' => now(),
                    ]);
                }

                $this->incidentService->transitionStatus(
                    $incident,
                    IncidentStatus::ResolutionSubmitted,
                    $citizen,
                    'Bukti penyelesaian diajukan oleh warga.',
                );

                return $submission->load(['incident', 'media', 'submitter']);
            });
        } catch (\Throwable $e) {
            $this->mediaStorage->deletePaths(array_column($storedMedia, 'file_path'));

            throw $e;
        }
    }

    public function approveResolution(ResolutionSubmission $submission, User $admin): ResolutionSubmission
    {
        if ($submission->status !== ResolutionStatus::Pending) {
            throw new InvalidArgumentException('Pengajuan penyelesaian ini sudah diproses.');
        }

        return DB::transaction(function () use ($submission, $admin): ResolutionSubmission {
            $submission->update([
                'status' => ResolutionStatus::Approved,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            $this->incidentService->transitionStatus(
                $submission->incident,
                IncidentStatus::Resolved,
                $admin,
                'Bukti penyelesaian disetujui administrator.',
            );

            return $submission->refresh();
        });
    }

    public function rejectResolution(ResolutionSubmission $submission, User $admin, string $reason): ResolutionSubmission
    {
        if ($submission->status !== ResolutionStatus::Pending) {
            throw new InvalidArgumentException('Pengajuan penyelesaian ini sudah diproses.');
        }

        return DB::transaction(function () use ($submission, $admin, $reason): ResolutionSubmission {
            $submission->update([
                'status' => ResolutionStatus::Rejected,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => $reason,
            ]);

            $this->incidentService->transitionStatus(
                $submission->incident,
                IncidentStatus::Verified,
                $admin,
                $reason,
            );

            return $submission->refresh();
        });
    }
}
