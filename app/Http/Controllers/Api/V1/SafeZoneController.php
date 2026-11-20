<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SafeZoneResource;
use App\Models\SafeZone;
use Illuminate\Http\JsonResponse;

class SafeZoneController extends Controller
{
    public function index(): JsonResponse
    {
        $safeZones = SafeZone::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => SafeZoneResource::collection($safeZones),
        ]);
    }
}
