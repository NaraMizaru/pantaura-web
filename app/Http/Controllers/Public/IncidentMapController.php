<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Enums\IncidentStatus;
use App\Http\Controllers\Controller;
use App\Models\Incident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncidentMapController extends Controller
{
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status');
        $activeStatus = is_string($statusFilter)
            && IncidentStatus::tryFrom($statusFilter) !== null
            && $statusFilter !== IncidentStatus::Rejected->value
            ? $statusFilter
            : null;

        $incidents = Incident::query()
            ->publiclyVisible()
            ->when($activeStatus !== null, fn ($q) => $q->where('status', $activeStatus))
            ->withCount('reports')
            ->latest()
            ->get()
            ->map(fn (Incident $incident): array => [
                'id' => $incident->id,
                'title' => $incident->title,
                'description' => $incident->description,
                'latitude' => $incident->latitude,
                'longitude' => $incident->longitude,
                'address' => $incident->address,
                'status' => $incident->status->value,
                'status_label' => $incident->status->label(),
                'reports_count' => $incident->reports_count ?? 0,
                'created_at' => $incident->created_at?->toIso8601String(),
            ]);

        $statusCounts = Incident::query()
            ->publiclyVisible()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('public/map', [
            'incidents' => $incidents,
            'activeStatus' => $activeStatus,
            'statusCounts' => [
                'all' => $statusCounts->sum(),
                'unverified' => (int) ($statusCounts[IncidentStatus::Unverified->value] ?? 0),
                'verified' => (int) ($statusCounts[IncidentStatus::Verified->value] ?? 0),
                'resolution_submitted' => (int) ($statusCounts[IncidentStatus::ResolutionSubmitted->value] ?? 0),
                'resolved' => (int) ($statusCounts[IncidentStatus::Resolved->value] ?? 0),
            ],
        ]);
    }

    public function show(Incident $incident): Response
    {
        if (! $incident->status->isPubliclyVisible()) {
            abort(404);
        }

        $incident->loadCount('reports');
        $incident->load([
            'reports.reporter:id,name',
            'reports.media',
            'resolutionSubmissions.submitter:id,name',
            'resolutionSubmissions.media',
            'statusHistories.actor:id,name',
        ]);

        return Inertia::render('public/incident-detail', [
            'incident' => [
                'id' => $incident->id,
                'title' => $incident->title,
                'description' => $incident->description,
                'latitude' => $incident->latitude,
                'longitude' => $incident->longitude,
                'address' => $incident->address,
                'status' => $incident->status->value,
                'status_label' => $incident->status->label(),
                'reports_count' => $incident->reports_count ?? 0,
                'verified_at' => $incident->verified_at?->toIso8601String(),
                'resolved_at' => $incident->resolved_at?->toIso8601String(),
                'created_at' => $incident->created_at?->toIso8601String(),
                'reports' => $incident->reports->map(fn ($report): array => [
                    'id' => $report->id,
                    'description' => $report->description,
                    'latitude' => $report->latitude,
                    'longitude' => $report->longitude,
                    'moderation_status' => $report->moderation_status->value,
                    'submitted_at' => $report->submitted_at->toIso8601String(),
                    'reporter_name' => $report->reporter->name ?? 'Warga',
                    'media' => $report->media->map(fn ($m): array => [
                        'id' => $m->id,
                        'url' => $m->url(),
                        'file_type' => $m->file_type->value,
                        'original_filename' => $m->original_filename,
                    ]),
                ]),
                'resolutions' => $incident->resolutionSubmissions->map(fn ($res): array => [
                    'id' => $res->id,
                    'description' => $res->description,
                    'status' => $res->status->value,
                    'rejection_reason' => $res->rejection_reason,
                    'created_at' => $res->created_at?->toIso8601String(),
                    'submitter_name' => $res->submitter->name ?? 'Warga',
                    'media' => $res->media->map(fn ($m): array => [
                        'id' => $m->id,
                        'url' => $m->url(),
                        'file_type' => $m->file_type->value,
                        'original_filename' => $m->original_filename,
                    ]),
                ]),
                'status_histories' => $incident->statusHistories->map(fn ($history): array => [
                    'id' => $history->id,
                    'previous_status' => $history->previous_status?->value,
                    'new_status' => $history->new_status->value,
                    'reason' => $history->reason,
                    'actor_name' => $history->actor->name ?? 'Sistem',
                    'created_at' => $history->created_at?->toIso8601String(),
                ]),
            ],
        ]);
    }
}
