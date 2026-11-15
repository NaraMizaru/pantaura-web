<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\ModerationStatus;
use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Report;
use App\Models\User;
use App\Services\IncidentService;
use App\Services\ReportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class ReportManagementController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
        private readonly IncidentService $incidentService,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $activeStatus = is_string($status) && ModerationStatus::tryFrom($status) !== null ? $status : null;

        $reports = Report::query()
            ->with(['reporter:id,name,email', 'incident:id,title,status'])
            ->withCount('media')
            ->when($activeStatus !== null, fn ($q) => $q->where('moderation_status', $activeStatus))
            ->latest('submitted_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Report $report): array => [
                'id' => $report->id,
                'description' => $report->description,
                'moderation_status' => $report->moderation_status->value,
                'submitted_at' => $report->submitted_at->toIso8601String(),
                'media_count' => $report->media_count ?? 0,
                'reporter' => [
                    'id' => $report->reporter?->id,
                    'name' => $report->reporter->name ?? 'Warga',
                ],
                'incident' => $report->incident !== null ? [
                    'id' => $report->incident->id,
                    'title' => $report->incident->title,
                    'status' => $report->incident->status->value,
                ] : null,
            ]);

        return Inertia::render('admin/reports/index', [
            'reports' => $reports,
            'activeStatus' => $activeStatus,
        ]);
    }

    public function show(Report $report): Response
    {
        $report->load(['reporter:id,name,email', 'reviewer:id,name', 'incident', 'media']);

        $nearbyCandidates = $this->incidentService->findNearbyCandidates(
            $report->latitude,
            $report->longitude,
            $report->incident_id,
        )->map(fn (Incident $incident): array => [
            'id' => $incident->id,
            'title' => $incident->title,
            'address' => $incident->address,
            'status' => $incident->status->value,
            'reports_count' => $incident->reports_count ?? 0,
            'distance_meters' => (int) ($incident->getAttribute('distance_meters') ?? 0),
        ]);

        return Inertia::render('admin/reports/show', [
            'report' => [
                'id' => $report->id,
                'description' => $report->description,
                'latitude' => $report->latitude,
                'longitude' => $report->longitude,
                'submitted_at' => $report->submitted_at->toIso8601String(),
                'moderation_status' => $report->moderation_status->value,
                'rejection_reason' => $report->rejection_reason,
                'reviewed_at' => $report->reviewed_at?->toIso8601String(),
                'reporter' => [
                    'id' => $report->reporter?->id,
                    'name' => $report->reporter->name ?? 'Warga',
                    'email' => $report->reporter?->email,
                ],
                'reviewer_name' => $report->reviewer?->name,
                'incident' => $report->incident !== null ? [
                    'id' => $report->incident->id,
                    'title' => $report->incident->title,
                    'status' => $report->incident->status->value,
                ] : null,
                'media' => $report->media->map(fn ($m): array => [
                    'id' => $m->id,
                    'url' => $m->url(),
                    'file_type' => $m->file_type->value,
                    'original_filename' => $m->original_filename,
                ]),
            ],
            'nearbyCandidates' => $nearbyCandidates,
        ]);
    }

    public function verify(Request $request, Report $report): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $this->reportService->verifyReport($report, $admin);

        return back()->with('success', 'Laporan berhasil diverifikasi.');
    }

    public function reject(Request $request, Report $report): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        /** @var User $admin */
        $admin = $request->user();

        $this->reportService->rejectReport($report, $admin, (string) $validated['reason']);

        return back()->with('success', 'Laporan berhasil ditolak.');
    }

    public function group(Request $request, Report $report): RedirectResponse
    {
        $validated = $request->validate([
            'target_incident_id' => ['required', 'uuid', 'exists:incidents,id'],
        ]);

        /** @var User $admin */
        $admin = $request->user();
        $targetIncident = Incident::findOrFail((string) $validated['target_incident_id']);

        try {
            $this->reportService->groupReportIntoIncident($report, $targetIncident, $admin);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Laporan berhasil dikelompokkan ke insiden terpilih.');
    }
}
