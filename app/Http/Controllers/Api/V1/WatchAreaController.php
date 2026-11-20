<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreWatchAreaRequest;
use App\Http\Resources\Api\V1\WatchAreaResource;
use App\Models\User;
use App\Models\WatchArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchAreaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $areas = WatchArea::query()
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => WatchAreaResource::collection($areas),
        ]);
    }

    public function store(StoreWatchAreaRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (WatchArea::query()->where('user_id', $user->id)->count() >= 5) {
            return response()->json([
                'message' => 'Maksimal 5 area pantauan per akun.',
            ], 422);
        }

        $validated = $request->validated();

        $area = WatchArea::create([
            'user_id' => $user->id,
            'label' => (string) $validated['label'],
            'latitude' => (float) $validated['latitude'],
            'longitude' => (float) $validated['longitude'],
            'radius_meters' => (int) ($validated['radius_meters'] ?? 3000),
        ]);

        return response()->json([
            'message' => 'Area pantauan berhasil disimpan.',
            'data' => new WatchAreaResource($area),
        ], 201);
    }

    public function destroy(Request $request, WatchArea $watchArea): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($watchArea->user_id !== $user->id) {
            abort(403);
        }

        $watchArea->delete();

        return response()->json([
            'message' => 'Area pantauan dihapus.',
        ]);
    }
}
