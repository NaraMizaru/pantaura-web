<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\DisasterType;
use App\Enums\IncidentStatus;
use App\Enums\ModerationStatus;
use App\Models\Incident;
use App\Models\IncidentStatusHistory;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ReportService
{
    public function __construct(
        private readonly MediaStorageService $mediaStorage,
        private readonly IncidentService $incidentService,
    ) {}

    /**
     * @param  array{latitude: float, longitude: float, description: string, address?: string|null, disaster_type?: DisasterType, urgent_needs?: list<string>}  $data
     * @param  array<int, UploadedFile>  $files
     */
    public function createInitialReport(User $citizen, array $data, array $files): Report
    {
        $storedMedia = $this->mediaStorage->storeMany($files, 'reports');

        try {
            return DB::transaction(function () use ($citizen, $data, $storedMedia): Report {
                $address = $data['address'] ?? null;
                $disasterType = $data['disaster_type'] ?? DisasterType::Flood;
                $prefix = $disasterType->titlePrefix();
                $title = $address !== null && $address !== ''
                    ? $prefix.' '.Str::limit($address, 60)
                    : 'Laporan '.$prefix.' '.Str::limit($data['description'], 50);

                $incident = Incident::create([
                    'title' => $title,
                    'disaster_type' => $disasterType,
                    'urgent_needs' => $data['urgent_needs'] ?? null,
                    'description' => $data['description'],
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'address' => $address,
                    'status' => IncidentStatus::Unverified,
                ]);

                $report = Report::create([
                    'incident_id' => $incident->id,
                    'user_id' => $citizen->id,
                    'description' => $data['description'],
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'submitted_at' => now(),
                    'moderation_status' => ModerationStatus::Pending,
                ]);

                foreach ($storedMedia as $media) {
                    $report->media()->create([
                        ...$media,
                        'created_at' => now(),
                    ]);
                }

                IncidentStatusHistory::create([
                    'incident_id' => $incident->id,
                    'previous_status' => null,
                    'new_status' => IncidentStatus::Unverified,
                    'changed_by' => $citizen->id,
                    'reason' => 'Laporan awal dikirim oleh warga.',
                    'created_at' => now(),
                ]);

                return $report->load(['incident', 'media', 'reporter']);
            });
        } catch (\Throwable $e) {
            $this->mediaStorage->deletePaths(array_column($storedMedia, 'file_path'));

            throw $e;
        }
    }

    /**
     * @param  array{latitude: float, longitude: float, description: string}  $data
     * @param  array<int, UploadedFile>  $files
     */
    public function addReportToIncident(User $citizen, Incident $incident, array $data, array $files): Report
    {
        if ($incident->status === IncidentStatus::Rejected) {
            throw new InvalidArgumentException('Tidak dapat menambahkan laporan pada insiden yang sudah ditolak.');
        }

        $storedMedia = $this->mediaStorage->storeMany($files, 'reports');

        try {
            return DB::transaction(function () use ($citizen, $incident, $data, $storedMedia): Report {
                $report = Report::create([
                    'incident_id' => $incident->id,
                    'user_id' => $citizen->id,
                    'description' => $data['description'],
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'submitted_at' => now(),
                    'moderation_status' => ModerationStatus::Pending,
                ]);

                foreach ($storedMedia as $media) {
                    $report->media()->create([
                        ...$media,
                        'created_at' => now(),
                    ]);
                }

                return $report->load(['incident', 'media', 'reporter']);
            });
        } catch (\Throwable $e) {
            $this->mediaStorage->deletePaths(array_column($storedMedia, 'file_path'));

            throw $e;
        }
    }

    public function verifyReport(Report $report, User $admin): Report
    {
        return DB::transaction(function () use ($report, $admin): Report {
            $report->update([
                'moderation_status' => ModerationStatus::Verified,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            if ($report->incident !== null && $report->incident->status === IncidentStatus::Unverified) {
                $this->incidentService->transitionStatus(
                    $report->incident,
                    IncidentStatus::Verified,
                    $admin,
                    'Laporan diverifikasi oleh administrator.',
                );
            }

            return $report->refresh();
        });
    }

    public function rejectReport(Report $report, User $admin, string $reason): Report
    {
        return DB::transaction(function () use ($report, $admin, $reason): Report {
            $report->update([
                'moderation_status' => ModerationStatus::Rejected,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
                'rejection_reason' => $reason,
            ]);

            $incident = $report->incident;
            if ($incident !== null && $incident->status === IncidentStatus::Unverified) {
                $hasOtherNonRejected = $incident->reports()
                    ->where('id', '!=', $report->id)
                    ->where('moderation_status', '!=', ModerationStatus::Rejected->value)
                    ->exists();

                if (! $hasOtherNonRejected) {
                    $this->incidentService->transitionStatus(
                        $incident,
                        IncidentStatus::Rejected,
                        $admin,
                        $reason,
                    );
                }
            }

            return $report->refresh();
        });
    }

    public function groupReportIntoIncident(Report $report, Incident $targetIncident, User $admin): Report
    {
        if ($report->incident_id === $targetIncident->id) {
            throw new InvalidArgumentException('Laporan sudah tergabung dalam insiden tersebut.');
        }

        if ($targetIncident->status === IncidentStatus::Rejected) {
            throw new InvalidArgumentException('Tidak dapat mengelompokkan laporan ke insiden yang ditolak.');
        }

        $sourceIncident = $report->incident;

        if ($sourceIncident !== null && $sourceIncident->disaster_type !== $targetIncident->disaster_type) {
            throw new InvalidArgumentException('Laporan hanya dapat dikelompokkan ke insiden dengan jenis bencana yang sama.');
        }

        return DB::transaction(function () use ($report, $targetIncident, $admin): Report {
            $previousIncident = $report->incident;

            $report->update([
                'incident_id' => $targetIncident->id,
                'moderation_status' => $report->moderation_status === ModerationStatus::Pending
                    ? ModerationStatus::Verified
                    : $report->moderation_status,
                'reviewed_by' => $report->reviewed_by ?? $admin->id,
                'reviewed_at' => $report->reviewed_at ?? now(),
            ]);

            if ($previousIncident !== null
                && $previousIncident->status === IncidentStatus::Unverified
                && $previousIncident->reports()->count() === 0
            ) {
                $previousIncident->delete();
            }

            return $report->refresh();
        });
    }
}
