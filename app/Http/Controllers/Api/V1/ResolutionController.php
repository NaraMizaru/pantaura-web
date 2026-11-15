<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreResolutionRequest;
use App\Http\Resources\Api\V1\ResolutionSubmissionResource;
use App\Models\Incident;
use App\Models\User;
use App\Services\ResolutionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;

class ResolutionController extends Controller
{
    public function __construct(
        private readonly ResolutionService $resolutionService,
    ) {}

    public function store(StoreResolutionRequest $request, Incident $incident): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();
        /** @var array<int, UploadedFile> $files */
        $files = $request->file('media', []);

        try {
            $submission = $this->resolutionService->submitResolution(
                $user,
                $incident,
                (string) $validated['description'],
                $files,
            );
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Bukti penyelesaian berhasil dikirim dan menunggu verifikasi.',
            'data' => new ResolutionSubmissionResource($submission),
        ], 201);
    }
}
