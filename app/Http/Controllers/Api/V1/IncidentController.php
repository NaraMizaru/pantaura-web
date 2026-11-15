<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\DisasterType;
use App\Enums\IncidentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\IncidentResource;
use App\Models\Incident;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class IncidentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $statusFilter = $request->query('status');
        $typeFilter = $request->query('type');
        $activeType = is_string($typeFilter) ? DisasterType::tryFrom($typeFilter) : null;

        $incidents = Incident::query()
            ->publiclyVisible()
            ->when(
                is_string($statusFilter) && IncidentStatus::tryFrom($statusFilter) !== null && $statusFilter !== IncidentStatus::Rejected->value,
                fn ($q) => $q->where('status', $statusFilter)
            )
            ->when($activeType !== null, fn ($q) => $q->where('disaster_type', $activeType->value))
            ->withCount('reports')
            ->latest()
            ->paginate(15);

        return IncidentResource::collection($incidents);
    }

    public function map(Request $request): JsonResponse
    {
        $statusFilter = $request->query('status');
        $typeFilter = $request->query('type');
        $activeType = is_string($typeFilter) ? DisasterType::tryFrom($typeFilter) : null;

        $incidents = Incident::query()
            ->publiclyVisible()
            ->when(
                is_string($statusFilter) && IncidentStatus::tryFrom($statusFilter) !== null && $statusFilter !== IncidentStatus::Rejected->value,
                fn ($q) => $q->where('status', $statusFilter)
            )
            ->when($activeType !== null, fn ($q) => $q->where('disaster_type', $activeType->value))
            ->withCount('reports')
            ->latest()
            ->get(['id', 'title', 'disaster_type', 'latitude', 'longitude', 'address', 'status', 'created_at']);

        return response()->json([
            'data' => IncidentResource::collection($incidents),
        ]);
    }

    public function show(Incident $incident): JsonResponse
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

        return response()->json([
            'data' => new IncidentResource($incident),
        ]);
    }
}
