<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\IncidentStatus;
use App\Enums\ModerationStatus;
use App\Enums\ResolutionStatus;
use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Report;
use App\Models\ResolutionSubmission;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'active_incidents' => Incident::query()
                ->whereIn('status', [
                    IncidentStatus::Unverified->value,
                    IncidentStatus::Verified->value,
                    IncidentStatus::ResolutionSubmitted->value,
                ])->count(),
            'pending_reports' => Report::query()
                ->where('moderation_status', ModerationStatus::Pending->value)
                ->count(),
            'pending_resolutions' => ResolutionSubmission::query()
                ->where('status', ResolutionStatus::Pending->value)
                ->count(),
            'resolved_incidents' => Incident::query()
                ->where('status', IncidentStatus::Resolved->value)
                ->count(),
        ];

        $recentReports = Report::query()
            ->with(['reporter:id,name', 'incident:id,title,status'])
            ->where('moderation_status', ModerationStatus::Pending->value)
            ->latest('submitted_at')
            ->limit(5)
            ->get()
            ->map(fn (Report $report): array => [
                'id' => $report->id,
                'description' => $report->description,
                'reporter_name' => $report->reporter->name ?? 'Warga',
                'incident_title' => $report->incident?->title,
                'submitted_at' => $report->submitted_at->toIso8601String(),
            ]);

        $recentResolutions = ResolutionSubmission::query()
            ->with(['submitter:id,name', 'incident:id,title'])
            ->where('status', ResolutionStatus::Pending->value)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (ResolutionSubmission $res): array => [
                'id' => $res->id,
                'incident_id' => $res->incident_id,
                'incident_title' => $res->incident->title ?? '-',
                'submitter_name' => $res->submitter->name ?? 'Warga',
                'description' => $res->description,
                'created_at' => $res->created_at?->toIso8601String(),
            ]);

        $mapIncidents = Incident::query()
            ->publiclyVisible()
            ->withCount('reports')
            ->latest()
            ->get()
            ->map(fn (Incident $incident): array => [
                'id' => $incident->id,
                'title' => $incident->title,
                'disaster_type' => $incident->disaster_type->value,
                'disaster_type_label' => $incident->disaster_type->label(),
                'description' => $incident->description,
                'latitude' => $incident->latitude,
                'longitude' => $incident->longitude,
                'address' => $incident->address,
                'status' => $incident->status->value,
                'status_label' => $incident->status->label(),
                'reports_count' => $incident->reports_count ?? 0,
                'created_at' => $incident->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'mapIncidents' => $mapIncidents,
            'recentReports' => $recentReports,
            'recentResolutions' => $recentResolutions,
        ]);
    }
}
