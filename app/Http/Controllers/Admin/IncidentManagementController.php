<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\DisasterType;
use App\Enums\IncidentStatus;
use App\Enums\UrgentNeed;
use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Services\IncidentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IncidentManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $activeStatus = is_string($status) && IncidentStatus::tryFrom($status) !== null ? $status : null;
        $type = $request->query('type');
        $activeType = is_string($type) ? DisasterType::tryFrom($type) : null;

        $incidents = Incident::query()
            ->withCount(['reports', 'confirmations', 'resolutionSubmissions'])
            ->when($activeStatus !== null, fn ($q) => $q->where('status', $activeStatus))
            ->when($activeType !== null, fn ($q) => $q->where('disaster_type', $activeType->value))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Incident $incident): array => [
                'id' => $incident->id,
                'title' => $incident->title,
                'disaster_type' => $incident->disaster_type->value,
                'disaster_type_label' => $incident->disaster_type->label(),
                'address' => $incident->address,
                'status' => $incident->status->value,
                'reports_count' => $incident->reports_count ?? 0,
                'confirmations_count' => $incident->confirmations_count ?? 0,
                'resolutions_count' => $incident->resolution_submissions_count ?? 0,
                'created_at' => $incident->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/incidents/index', [
            'incidents' => $incidents,
            'activeStatus' => $activeStatus,
            'activeType' => $activeType?->value,
        ]);
    }

    public function show(Incident $incident): Response
    {
        $incident->loadCount(['reports', 'confirmations']);
        $incident->load([
            'verifier:id,name',
            'reports.reporter:id,name',
            'reports.media',
            'resolutionSubmissions.submitter:id,name',
            'resolutionSubmissions.media',
            'statusHistories.actor:id,name',
        ]);

        /** @var list<string> $needs */
        $needs = is_array($incident->urgent_needs) ? array_values($incident->urgent_needs) : [];

        return Inertia::render('admin/incidents/show', [
            'incident' => [
                'id' => $incident->id,
                'title' => $incident->title,
                'disaster_type' => $incident->disaster_type->value,
                'disaster_type_label' => $incident->disaster_type->label(),
                'urgent_needs' => $needs,
                'confirmations_count' => $incident->confirmations_count ?? 0,
                'description' => $incident->description,
                'latitude' => $incident->latitude,
                'longitude' => $incident->longitude,
                'address' => $incident->address,
                'status' => $incident->status->value,
                'verifier_name' => $incident->verifier?->name,
                'verified_at' => $incident->verified_at?->toIso8601String(),
                'resolved_at' => $incident->resolved_at?->toIso8601String(),
                'created_at' => $incident->created_at?->toIso8601String(),
                'reports' => $incident->reports->map(fn ($r): array => [
                    'id' => $r->id,
                    'description' => $r->description,
                    'moderation_status' => $r->moderation_status->value,
                    'submitted_at' => $r->submitted_at->toIso8601String(),
                    'reporter_name' => $r->reporter->name ?? 'Warga',
                    'media' => $r->media->map(fn ($m): array => [
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
                'status_histories' => $incident->statusHistories->map(fn ($h): array => [
                    'id' => $h->id,
                    'previous_status' => $h->previous_status?->value,
                    'new_status' => $h->new_status->value,
                    'reason' => $h->reason,
                    'actor_name' => $h->actor->name ?? 'Sistem',
                    'created_at' => $h->created_at?->toIso8601String(),
                ]),
            ],
        ]);
    }

    public function updateNeeds(
        Request $request,
        Incident $incident,
        IncidentService $incidentService,
    ): RedirectResponse {
        $validated = $request->validate([
            'urgent_needs' => ['present', 'array', 'max:6'],
            'urgent_needs.*' => ['required', Rule::enum(UrgentNeed::class)],
        ]);

        /** @var list<string> $needs */
        $needs = array_values(array_map('strval', $validated['urgent_needs']));

        $incidentService->updateUrgentNeeds($incident, $needs);

        return back()->with('success', 'Kebutuhan mendesak insiden diperbarui.');
    }
}
