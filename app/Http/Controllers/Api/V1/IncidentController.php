<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\DisasterType;
use App\Enums\IncidentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\IncidentResource;
use App\Models\Incident;
use App\Models\User;
use App\Services\IncidentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;

class IncidentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $statusFilter = $request->query('status');
        $activeStatus = is_string($statusFilter)
            && IncidentStatus::tryFrom($statusFilter) !== null
            && $statusFilter !== IncidentStatus::Rejected->value
            ? $statusFilter
            : null;
        $typeFilter = $request->query('type');
        $activeType = is_string($typeFilter) ? DisasterType::tryFrom($typeFilter) : null;

        $incidents = Incident::query()
            ->publiclyVisible()
            ->when(
                $activeStatus !== null,
                fn ($q) => $q->where('status', $activeStatus),
                fn ($q) => $q->where('status', '!=', IncidentStatus::Resolved->value)
            )
            ->when($activeType !== null, fn ($q) => $q->where('disaster_type', $activeType->value))
            ->withCount(['reports', 'confirmations'])
            ->latest()
            ->paginate(15);

        return IncidentResource::collection($incidents);
    }

    public function map(Request $request): JsonResponse
    {
        $statusFilter = $request->query('status');
        $activeStatus = is_string($statusFilter)
            && IncidentStatus::tryFrom($statusFilter) !== null
            && $statusFilter !== IncidentStatus::Rejected->value
            ? $statusFilter
            : null;
        $typeFilter = $request->query('type');
        $activeType = is_string($typeFilter) ? DisasterType::tryFrom($typeFilter) : null;

        $incidents = Incident::query()
            ->publiclyVisible()
            ->when(
                $activeStatus !== null,
                fn ($q) => $q->where('status', $activeStatus),
                fn ($q) => $q->where('status', '!=', IncidentStatus::Resolved->value)
            )
            ->when($activeType !== null, fn ($q) => $q->where('disaster_type', $activeType->value))
            ->withCount(['reports', 'confirmations'])
            ->latest()
            ->get(['id', 'title', 'disaster_type', 'urgent_needs', 'latitude', 'longitude', 'address', 'status', 'created_at']);

        return response()->json([
            'data' => IncidentResource::collection($incidents),
        ]);
    }

    public function nearby(Request $request, IncidentService $incidentService): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'type' => ['sometimes', 'string'],
            'radius' => ['sometimes', 'integer', 'min:100', 'max:5000'],
        ]);

        $type = isset($validated['type']) ? DisasterType::tryFrom((string) $validated['type']) : null;
        $radiusMeters = (int) ($validated['radius'] ?? 500);

        $candidates = $incidentService->findNearbyCandidates(
            latitude: (float) $validated['lat'],
            longitude: (float) $validated['lng'],
            type: $type,
            radiusKm: $radiusMeters / 1000.0,
        );

        $candidates->loadCount(['reports', 'confirmations']);

        return response()->json([
            'data' => IncidentResource::collection($candidates),
        ]);
    }

    public function show(Incident $incident): JsonResponse
    {
        if (! $incident->status->isPubliclyVisible()) {
            abort(404);
        }

        $incident->loadCount(['reports', 'confirmations']);
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

    public function confirm(Request $request, Incident $incident, IncidentService $incidentService): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $result = $incidentService->toggleConfirmation($incident, $user);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => $result['confirmed']
                ? 'Konfirmasi warga berhasil ditambahkan.'
                : 'Konfirmasi warga dibatalkan.',
            'data' => $result,
        ]);
    }
}
