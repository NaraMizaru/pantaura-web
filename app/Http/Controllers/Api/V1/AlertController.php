<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\IncidentAlertResource;
use App\Models\IncidentAlert;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $alerts = IncidentAlert::query()
            ->where('user_id', $user->id)
            ->with(['watchArea', 'incident'])
            ->latest()
            ->limit(30)
            ->get();

        return response()->json([
            'data' => IncidentAlertResource::collection($alerts),
        ]);
    }

    public function markAsRead(Request $request, IncidentAlert $alert): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($alert->user_id !== $user->id) {
            abort(403);
        }

        if ($alert->read_at === null) {
            $alert->update(['read_at' => now()]);
        }

        return response()->json([
            'message' => 'Notifikasi ditandai sudah dibaca.',
        ]);
    }
}
